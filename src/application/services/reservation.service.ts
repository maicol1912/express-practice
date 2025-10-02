import { injectable, inject } from 'tsyringe';
import { ReservationUseCase } from '@domain/ports/in/reservation.use-case';
import { InventoryRepositoryPort } from '@domain/ports/out/inventory-repository.port';
import { ReservationRepositoryPort } from '@domain/ports/out/reservation-repository.port';
import { InventoryTransactionRepositoryPort } from '@domain/ports/out/inventory-transaction-repository.port';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { InventoryItem } from '@domain/models/inventory-item.model';
import { Reservation } from '@domain/models/reservation.model';
import { InventoryTransaction, TransactionType } from '@domain/models/inventory-transaction.model';
import { StockReservedEvent } from '@domain/events/stock-reserved.event';
import { StockReleasedEvent } from '@domain/events/stock-released.event';
import { SaleConfirmedEvent } from '@domain/events/sale-confirmed.event';
import { InventoryUpdatedEvent } from '@domain/events/inventory-updated.event';
import { NotFoundException, AlreadyExistsException, InvalidReservationException } from '@domain/exceptions/domain.exception';
import { DistributedLock } from '@shared/decorators/distributed-lock.decorator';
import { CircuitBreakerDecorator } from '@shared/decorators/circuit-breaker.decorator';
import { Retry } from '@shared/decorators/retry.decorator';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class ReservationService implements ReservationUseCase {
  constructor(
    @inject('InventoryRepositoryPort') private inventoryRepository: InventoryRepositoryPort,
    @inject('ReservationRepositoryPort') private reservationRepository: ReservationRepositoryPort,
    @inject('InventoryTransactionRepositoryPort') private transactionRepository: InventoryTransactionRepositoryPort,
    @inject('EventPublisherPort') private eventPublisher: EventPublisherPort
  ) { }

  @DistributedLock({ key: 'reservation:${0}:${1}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('reservation-reserve', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async reserveStock(
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string,
    _customerId?: string
  ): Promise<InventoryItem> {
    logger.info('Reserving stock', { storeId, productId, qty, orderRef });

    // Check if reservation already exists
    const existing = await this.reservationRepository.findActiveByOrderRef(orderRef);
    if (existing) {
      throw new AlreadyExistsException('Reservation', 'orderRef', orderRef);
    }

    // Get inventory with lock
    const inventory = await this.inventoryRepository.findByProductAndStore(
      productId,
      storeId,
      true
    );

    if (!inventory) {
      throw new NotFoundException('Inventory', 'productId and storeId', `${productId}, ${storeId}`);
    }

    // Check availability
    if (!inventory.canReserve(qty)) {
      throw new InvalidReservationException(
        `Cannot reserve ${qty} units. Available: ${inventory.available}`
      );
    }

    // Create reservation
    const reservation = Reservation.create(
      uuidv4(),
      storeId,
      productId,
      qty,
      orderRef,
      15 // 15 minutes TTL
    );

    // Reserve stock
    inventory.reserveStock(qty);

    // Save
    await this.reservationRepository.save(reservation);
    const updated = await this.inventoryRepository.save(inventory);

    // Save transaction
    const transaction = new InventoryTransaction(
      uuidv4(),
      inventory.id,
      productId,
      storeId,
      TransactionType.RESERVE,
      qty,
      inventory.onHand,
      'SYSTEM',
      orderRef,
      null,
      new Date()
    );
    await this.transactionRepository.save(transaction);

    // Publish events
    await this.eventPublisher.publish(
      new StockReservedEvent(
        reservation.id,
        productId,
        storeId,
        qty,
        orderRef,
        reservation.expiresAt
      )
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(inventory.id, productId, storeId)
    );

    logger.info('Stock reserved successfully', { reservationId: reservation.id });
    return updated;
  }

  @DistributedLock({ key: 'reservation:${0}:${1}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('reservation-release', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async releaseStock(
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string
  ): Promise<InventoryItem> {
    logger.info('Releasing stock', { storeId, productId, qty, orderRef });

    // Find active reservation
    const reservation = await this.reservationRepository.findActiveByOrderRef(orderRef);
    if (!reservation) {
      throw new NotFoundException('Reservation', 'orderRef', orderRef);
    }

    if (reservation.status !== 'ACTIVE') {
      throw new InvalidReservationException(
        `Reservation is not active. Status: ${reservation.status}`
      );
    }

    // Get inventory with lock
    const inventory = await this.inventoryRepository.findByProductAndStore(
      productId,
      storeId,
      true
    );

    if (!inventory) {
      throw new NotFoundException('Inventory', 'productId and storeId', `${productId}, ${storeId}`);
    }

    // Cancel reservation
    reservation.cancel('Released by user');

    // Release stock
    inventory.releaseStock(qty);

    // Save
    await this.reservationRepository.save(reservation);
    const updated = await this.inventoryRepository.save(inventory);

    // Save transaction
    const transaction = new InventoryTransaction(
      uuidv4(),
      inventory.id,
      productId,
      storeId,
      TransactionType.RELEASE,
      qty,
      inventory.onHand,
      'SYSTEM',
      orderRef,
      null,
      new Date()
    );
    await this.transactionRepository.save(transaction);

    // Publish events
    await this.eventPublisher.publish(
      new StockReleasedEvent(reservation.id, productId, storeId, qty, orderRef)
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(inventory.id, productId, storeId)
    );

    logger.info('Stock released successfully', { reservationId: reservation.id });
    return updated;
  }

  @DistributedLock({ key: 'sale:${0}:${1}', waitTimeoutSeconds: 30, leaseTimeSeconds: 60 })
  @CircuitBreakerDecorator('reservation-confirm', { timeout: 3000 })
  @Retry({ maxAttempts: 3, delayMs: 1000 })
  async confirmSale(
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string
  ): Promise<InventoryItem> {
    logger.info('Confirming sale', { storeId, productId, qty, orderRef });

    // Find active reservation
    const reservation = await this.reservationRepository.findActiveByOrderRef(orderRef);
    if (!reservation) {
      throw new NotFoundException('Reservation', 'orderRef', orderRef);
    }

    if (reservation.qty !== qty) {
      throw new InvalidReservationException(
        `Quantity mismatch. Reserved: ${reservation.qty}, Confirming: ${qty}`
      );
    }

    // Get inventory with lock
    const inventory = await this.inventoryRepository.findByProductAndStore(
      productId,
      storeId,
      true
    );

    if (!inventory) {
      throw new NotFoundException('Inventory', 'productId and storeId', `${productId}, ${storeId}`);
    }

    // Confirm reservation
    reservation.commit();

    // Confirm sale
    inventory.confirmSale(qty);

    // Save
    await this.reservationRepository.save(reservation);
    const updated = await this.inventoryRepository.save(inventory);

    // Save transaction
    const transaction = new InventoryTransaction(
      uuidv4(),
      inventory.id,
      productId,
      storeId,
      TransactionType.SALE,
      qty,
      inventory.onHand,
      'SYSTEM',
      orderRef,
      null,
      new Date()
    );
    await this.transactionRepository.save(transaction);

    // Publish events
    await this.eventPublisher.publish(
      new SaleConfirmedEvent(reservation.id, productId, storeId, qty, orderRef)
    );

    await this.eventPublisher.publish(
      new InventoryUpdatedEvent(inventory.id, productId, storeId)
    );

    logger.info('Sale confirmed successfully', { reservationId: reservation.id });
    return updated;
  }
}
