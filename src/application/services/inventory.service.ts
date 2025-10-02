import { injectable, inject } from 'tsyringe';
import { InventoryUseCase } from '@domain/ports/in/inventory.use-case';
import { InventoryRepositoryPort } from '@domain/ports/out/inventory-repository.port';
import { ProductRepositoryPort } from '@domain/ports/out/product-repository.port';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { InventoryTransactionRepositoryPort } from '@domain/ports/out/inventory-transaction-repository.port';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { CachePort } from '@domain/ports/out/cache.port';
import { InventoryItem } from '@domain/models/inventory-item.model';
import { StockAvailability, SyncStatus } from '@domain/value-objects/stock-availability.vo';
import { InventoryTransaction, TransactionType } from '@domain/models/inventory-transaction.model';
import { InventoryAdjustedEvent } from '@domain/events/inventory-adjusted.event';
import { InventoryRestockedEvent } from '@domain/events/inventory-restocked.event';
import { InventoryUpdatedEvent } from '@domain/events/inventory-updated.event';
import { NotFoundException } from '@domain/exceptions/domain.exception';
import { DistributedLock } from '@shared/decorators/distributed-lock.decorator';
import { CircuitBreakerDecorator } from '@shared/decorators/circuit-breaker.decorator';
import { Retry } from '@shared/decorators/retry.decorator';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@injectable()
export class InventoryService implements InventoryUseCase {
  constructor(
    @inject('InventoryRepositoryPort') private inventoryRepository: InventoryRepositoryPort,
    @inject('ProductRepositoryPort') private productRepository: ProductRepositoryPort,
    @inject('StoreRepositoryPort') private storeRepository: StoreRepositoryPort,
    @inject('InventoryTransactionRepositoryPort') private transactionRepository: InventoryTransactionRepositoryPort,
    @inject('EventPublisherPort') private eventPublisher: EventPublisherPort,
    @inject('CachePort') private cacheService: CachePort
  ) { }

  @DistributedLock({ key: 'inventory:${0}:${1}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('inventory-adjust', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  async adjustStock(
    storeId: string,
    productId: string,
    qty: number,
    actor: string,
    referenceId: string | null = null,
    notes?: string
  ): Promise<InventoryItem> {
    logger.info('Adjusting stock', { storeId, productId, qty, actor });

    // Validate store and product exist
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store', 'id', storeId);
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product', 'id', productId);
    }

    // Get or create inventory item with lock
    let inventory = await this.inventoryRepository.findByProductAndStore(
      productId,
      storeId,
      true
    );

    if (!inventory) {
      inventory = new InventoryItem(
        uuidv4(),
        productId,
        storeId,
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

    // Adjust stock
    inventory.adjustStock(qty);
    inventory.lastUpdatedBy = actor;

    // Save inventory
    const updated = await this.inventoryRepository.save(inventory);

    // Save transaction
    const transaction = new InventoryTransaction(
      uuidv4(),
      updated.id,
      productId,
      storeId,
      qty > 0 ? TransactionType.ADJUST_INCREASE : TransactionType.ADJUST_DECREASE,
      qty,
      updated.onHand,
      actor,
      referenceId,
      notes || null,
      new Date()
    );
    await this.transactionRepository.save(transaction);

    // Publish events
    await this.eventPublisher.publish(
      new InventoryAdjustedEvent(
        updated.id,
        productId,
        storeId,
        qty,
        updated.onHand,
        actor
      )
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(updated.id, productId, storeId)
    );

    logger.info('Stock adjusted successfully', { inventoryId: updated.id });
    return updated;
  }

  @DistributedLock({ key: 'inventory:${0}:${1}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('inventory-restock', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  async restock(
    storeId: string,
    productId: string,
    qty: number,
    actor: string,
    referenceId: string | null = null,
    notes?: string
  ): Promise<InventoryItem> {
    logger.info('Restocking inventory', { storeId, productId, qty, actor });

    if (qty <= 0) {
      throw new Error('Restock quantity must be positive');
    }

    // Validate store and product
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store', 'id', storeId);
    }

    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product', 'id', productId);
    }

    // Get or create inventory item
    let inventory = await this.inventoryRepository.findByProductAndStore(
      productId,
      storeId,
      true
    );

    if (!inventory) {
      inventory = new InventoryItem(
        uuidv4(),
        productId,
        storeId,
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

    // Add stock
    inventory.addStock(qty);
    inventory.lastUpdatedBy = actor;

    // Save
    const updated = await this.inventoryRepository.save(inventory);

    // Save transaction
    const transaction = new InventoryTransaction(
      uuidv4(),
      updated.id,
      productId,
      storeId,
      TransactionType.RESTOCK,
      qty,
      updated.onHand,
      actor,
      referenceId,
      notes || null,
      new Date()
    );
    await this.transactionRepository.save(transaction);

    // Publish events
    await this.eventPublisher.publish(
      new InventoryRestockedEvent(
        updated.id,
        productId,
        storeId,
        qty,
        updated.onHand,
        actor
      )
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(updated.id, productId, storeId)
    );

    logger.info('Restock completed', { inventoryId: updated.id });
    return updated;
  }

  async getStockAvailability(
    productId: string,
    storeId: string,
    useCache: boolean = true
  ): Promise<StockAvailability> {
    const cacheKey = `availability:${productId}:${storeId}`;

    // Try cache first
    if (useCache) {
      const cached = await this.cacheService.get<StockAvailability>(cacheKey);
      if (cached) {
        logger.debug('Stock availability from cache', { cacheKey });
        return cached;
      }
    }

    // Get from database
    const availability = await this.inventoryRepository.getStockAvailability(
      productId,
      storeId
    );

    if (!availability) {
      throw new NotFoundException('Inventory', 'productId and storeId', `${productId}, ${storeId}`);
    }

    // Cache it
    const ttl = parseInt(process.env.STOCK_AVAILABILITY_TTL || '30');
    await this.cacheService.set(cacheKey, availability, ttl);

    return availability;
  }

  async listInventoryByStore(storeId: string): Promise<InventoryItem[]> {
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store', 'id', storeId);
    }

    return this.inventoryRepository.listByStore(storeId);
  }

  async listLowStockItems(storeId: string, threshold: number = 10): Promise<InventoryItem[]> {
    const store = await this.storeRepository.findById(storeId);
    if (!store) {
      throw new NotFoundException('Store', 'id', storeId);
    }

    return this.inventoryRepository.findLowStock(storeId, threshold);
  }
}
