import { injectable, inject } from 'tsyringe';
import { TransferUseCase } from '@domain/ports/in/transfer.use-case';
import { TransferRepositoryPort } from '@domain/ports/out/transfer-repository.port';
import { InventoryRepositoryPort } from '@domain/ports/out/inventory-repository.port';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { ProductRepositoryPort } from '@domain/ports/out/product-repository.port';
import { InventoryTransactionRepositoryPort } from '@domain/ports/out/inventory-transaction-repository.port';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { Transfer, TransferStatus } from '@domain/models/transfer.model';
import { InventoryItem } from '@domain/models/inventory-item.model';
import { InventoryTransaction, TransactionType } from '@domain/models/inventory-transaction.model';
import { TransferCreatedEvent } from '@domain/events/transfer-created.event';
import { TransferCompletedEvent } from '@domain/events/transfer-completed.event';
import { InventoryUpdatedEvent } from '@domain/events/inventory-updated.event';
import { NotFoundException, InvalidStateException } from '@domain/exceptions/domain.exception';
import { SyncStatus } from '@domain/value-objects/stock-availability.vo';
import { DistributedLock } from '@shared/decorators/distributed-lock.decorator';
import { CircuitBreakerDecorator } from '@shared/decorators/circuit-breaker.decorator';
import { Retry } from '@shared/decorators/retry.decorator';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class TransferService implements TransferUseCase {
  constructor(
    @inject('TransferRepositoryPort') private transferRepository: TransferRepositoryPort,
    @inject('InventoryRepositoryPort') private inventoryRepository: InventoryRepositoryPort,
    @inject('StoreRepositoryPort') private storeRepository: StoreRepositoryPort,
    @inject('ProductRepositoryPort') private productRepository: ProductRepositoryPort,
    @inject('InventoryTransactionRepositoryPort') private transactionRepository: InventoryTransactionRepositoryPort,
    @inject('EventPublisherPort') private eventPublisher: EventPublisherPort
  ) { }

  @DistributedLock({ key: 'transfer:create:${0}:${1}:${2}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('transfer-create', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async createTransfer(
    fromStoreId: string,
    toStoreId: string,
    productId: string,
    quantity: number,
    requestedBy: string
  ): Promise<Transfer> {
    logger.info('Creating transfer', { fromStoreId, toStoreId, productId, quantity, requestedBy });

    // Validate inputs
    if (fromStoreId === toStoreId) {
      throw new InvalidStateException('Transfer cannot be created between the same store');
    }

    if (quantity <= 0) {
      throw new InvalidStateException('Transfer quantity must be positive');
    }

    // Validate stores exist
    const fromStore = await this.storeRepository.findById(fromStoreId);
    if (!fromStore) {
      throw new NotFoundException('Store', 'id', fromStoreId);
    }

    const toStore = await this.storeRepository.findById(toStoreId);
    if (!toStore) {
      throw new NotFoundException('Store', 'id', toStoreId);
    }

    // Validate product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product', 'id', productId);
    }

    // Check if source store has enough stock
    const sourceInventory = await this.inventoryRepository.findByProductAndStore(
      productId,
      fromStoreId,
      true
    );

    if (!sourceInventory) {
      throw new NotFoundException('Inventory', 'productId and storeId', `${productId}, ${fromStoreId}`);
    }

    if (sourceInventory.available < quantity) {
      throw new InvalidStateException(
        `Insufficient stock for transfer. Available: ${sourceInventory.available}, Requested: ${quantity}`
      );
    }

    // Create transfer
    const transfer = new Transfer(
      uuidv4(),
      fromStoreId,
      toStoreId,
      productId,
      quantity,
      TransferStatus.PENDING,
      requestedBy,
      null,
      new Date(),
      null,
      null
    );

    // Save transfer
    const savedTransfer = await this.transferRepository.save(transfer);

    // Publish event
    await this.eventPublisher.publish(
      new TransferCreatedEvent(
        savedTransfer.id,
        fromStoreId,
        toStoreId,
        productId,
        quantity,
        requestedBy
      )
    );

    logger.info('Transfer created successfully', { transferId: savedTransfer.id });
    return savedTransfer;
  }

  @DistributedLock({ key: 'transfer:start:${0}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('transfer-start', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async startTransfer(transferId: string, actor: string): Promise<Transfer> {
    logger.info('Starting transfer', { transferId, actor });

    // Get transfer
    const transfer = await this.transferRepository.findById(transferId);
    if (!transfer) {
      throw new NotFoundException('Transfer', 'id', transferId);
    }

    // Validate transfer can be started
    if (!transfer.canStart()) {
      throw new InvalidStateException(
        `Transfer cannot be started. Current status: ${transfer.status}`
      );
    }

    // Get source inventory with lock
    const sourceInventory = await this.inventoryRepository.findByProductAndStore(
      transfer.productId,
      transfer.fromStoreId,
      true
    );

    if (!sourceInventory) {
      throw new NotFoundException(
        'Inventory',
        'productId and storeId',
        `${transfer.productId}, ${transfer.fromStoreId}`
      );
    }

    // Check availability again
    if (sourceInventory.available < transfer.qty) {
      throw new InvalidStateException(
        `Insufficient stock for transfer. Available: ${sourceInventory.available}, Required: ${transfer.qty}`
      );
    }

    // Reserve stock from source
    sourceInventory.reserveStock(transfer.qty);

    // Save source inventory
    await this.inventoryRepository.save(sourceInventory);

    // Save transaction for source store
    const sourceTransaction = new InventoryTransaction(
      uuidv4(),
      sourceInventory.id,
      transfer.productId,
      transfer.fromStoreId,
      TransactionType.TRANSFER_OUT,
      -transfer.qty,
      sourceInventory.onHand,
      actor,
      transferId,
      `Transfer to store ${transfer.toStoreId}`,
      new Date()
    );
    await this.transactionRepository.save(sourceTransaction);

    // Start transfer
    transfer.start(actor);

    // Save transfer
    const updatedTransfer = await this.transferRepository.save(transfer);

    // Publish event
    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(
        sourceInventory.id,
        transfer.productId,
        transfer.fromStoreId
      )
    );

    logger.info('Transfer started successfully', { transferId: updatedTransfer.id });
    return updatedTransfer;
  }

  @DistributedLock({ key: 'transfer:complete:${0}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('transfer-complete', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async completeTransfer(transferId: string, actor: string): Promise<Transfer> {
    logger.info('Completing transfer', { transferId, actor });

    // Get transfer
    const transfer = await this.transferRepository.findById(transferId);
    if (!transfer) {
      throw new NotFoundException('Transfer', 'id', transferId);
    }

    // Validate transfer can be completed
    if (!transfer.canComplete()) {
      throw new InvalidStateException(
        `Transfer cannot be completed. Current status: ${transfer.status}`
      );
    }

    // Get source inventory with lock
    const sourceInventory = await this.inventoryRepository.findByProductAndStore(
      transfer.productId,
      transfer.fromStoreId,
      true
    );

    if (!sourceInventory) {
      throw new NotFoundException(
        'Inventory',
        'productId and storeId',
        `${transfer.productId}, ${transfer.fromStoreId}`
      );
    }

    // Get or create destination inventory with lock
    let destInventory = await this.inventoryRepository.findByProductAndStore(
      transfer.productId,
      transfer.toStoreId,
      true
    );

    if (!destInventory) {
      destInventory = new InventoryItem(
        uuidv4(),
        transfer.productId,
        transfer.toStoreId,
        0,
        0,
        0,
        0,
        0,
        0,
        SyncStatus.SYNCED,
        null,
        new Date(),
        new Date(),
        actor
      );
    }

    // Remove reserved stock from source and decrease onHand
    sourceInventory.confirmSale(transfer.qty);

    // Add stock to destination
    destInventory.addStock(transfer.qty);
    destInventory.lastUpdatedBy = actor;

    // Save inventories
    await this.inventoryRepository.save(sourceInventory);
    await this.inventoryRepository.save(destInventory);

    // Save transaction for destination store
    const destTransaction = new InventoryTransaction(
      uuidv4(),
      destInventory.id,
      transfer.productId,
      transfer.toStoreId,
      TransactionType.TRANSFER_IN,
      transfer.qty,
      destInventory.onHand,
      actor,
      transferId,
      `Transfer from store ${transfer.fromStoreId}`,
      new Date()
    );
    await this.transactionRepository.save(destTransaction);

    // Complete transfer
    transfer.complete(actor);

    // Save transfer
    const updatedTransfer = await this.transferRepository.save(transfer);

    // Publish events
    await this.eventPublisher.publish(
      new TransferCompletedEvent(
        updatedTransfer.id,
        transfer.fromStoreId,
        transfer.toStoreId,
        transfer.productId,
        transfer.qty
      )
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(
        sourceInventory.id,
        transfer.productId,
        transfer.fromStoreId
      )
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(
        destInventory.id,
        transfer.productId,
        transfer.toStoreId
      )
    );

    logger.info('Transfer completed successfully', { transferId: updatedTransfer.id });
    return updatedTransfer;
  }

  @DistributedLock({ key: 'transfer:fail:${0}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('transfer-fail', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async failTransfer(transferId: string, actor: string): Promise<Transfer> {
    logger.info('Failing transfer', { transferId, actor });

    // Get transfer
    const transfer = await this.transferRepository.findById(transferId);
    if (!transfer) {
      throw new NotFoundException('Transfer', 'id', transferId);
    }

    // Validate transfer can be failed
    if (!transfer.canFail()) {
      throw new InvalidStateException(
        `Transfer cannot be failed. Current status: ${transfer.status}`
      );
    }

    // If transfer was in transit, release reserved stock
    if (transfer.status === TransferStatus.IN_TRANSIT) {
      const sourceInventory = await this.inventoryRepository.findByProductAndStore(
        transfer.productId,
        transfer.fromStoreId,
        true
      );

      if (sourceInventory) {
        // Release reserved stock back to available
        sourceInventory.releaseStock(transfer.qty);

        // Save inventory
        await this.inventoryRepository.save(sourceInventory);

        // Save transaction
        const transaction = new InventoryTransaction(
          uuidv4(),
          sourceInventory.id,
          transfer.productId,
          transfer.fromStoreId,
          TransactionType.RELEASE,
          transfer.qty,
          sourceInventory.onHand,
          actor,
          transferId,
          'Transfer failed - stock released',
          new Date()
        );
        await this.transactionRepository.save(transaction);

        // Publish event
        await this.eventPublisher.publish(
          new InventoryUpdatedEvent(
            sourceInventory.id,
            transfer.productId,
            transfer.fromStoreId
          )
        );
      }
    }

    // Fail transfer
    transfer.fail(actor);

    // Save transfer
    const updatedTransfer = await this.transferRepository.save(transfer);

    logger.info('Transfer failed', { transferId: updatedTransfer.id, status: updatedTransfer.status });
    return updatedTransfer;
  }

  async listTransfers(
    storeId?: string,
    productId?: string,
    status?: TransferStatus
  ): Promise<Transfer[]> {
    logger.debug('Listing transfers', { storeId, productId, status });

    // If storeId is provided, validate it exists
    if (storeId) {
      const store = await this.storeRepository.findById(storeId);
      if (!store) {
        throw new NotFoundException('Store', 'id', storeId);
      }
    }

    // If productId is provided, validate it exists
    if (productId) {
      const product = await this.productRepository.findById(productId);
      if (!product) {
        throw new NotFoundException('Product', 'id', productId);
      }
    }

    // Fetch transfers based on filters
    return this.transferRepository.findAll(storeId, productId, status);
  }

  async getTransferById(id: string): Promise<Transfer> {
    logger.debug('Getting transfer by id', { id });

    const transfer = await this.transferRepository.findById(id);
    if (!transfer) {
      throw new NotFoundException('Transfer', 'id', id);
    }

    return transfer;
  }
}
