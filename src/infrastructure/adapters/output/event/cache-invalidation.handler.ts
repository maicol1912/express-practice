import { EventBus } from './event-bus';
import { InventoryUpdatedEvent } from '@domain/events/inventory-updated.event';
import { StockReservedEvent } from '@domain/events/stock-reserved.event';
import { StockReleasedEvent } from '@domain/events/stock-released.event';
import { SaleConfirmedEvent } from '@domain/events/sale-confirmed.event';
import { RedisCacheService } from '../cache/redis-cache.service';
import { logger } from '@infrastructure/config/logger.config';

export class CacheInvalidationHandler {
  private cacheService: RedisCacheService;
  private eventBus: EventBus;

  constructor() {
    this.cacheService = new RedisCacheService();
    this.eventBus = EventBus.getInstance();
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.eventBus.subscribe<InventoryUpdatedEvent>(
      'InventoryUpdatedEvent',
      this.handleInventoryUpdated.bind(this)
    );

    this.eventBus.subscribe<StockReservedEvent>(
      'StockReservedEvent',
      this.handleStockReserved.bind(this)
    );

    this.eventBus.subscribe<StockReleasedEvent>(
      'StockReleasedEvent',
      this.handleStockReleased.bind(this)
    );

    this.eventBus.subscribe<SaleConfirmedEvent>(
      'SaleConfirmedEvent',
      this.handleSaleConfirmed.bind(this)
    );

    logger.info('Cache invalidation handlers registered');
  }

  private async handleInventoryUpdated(event: InventoryUpdatedEvent): Promise<void> {
    const cacheKey = `availability:${event.productId}:${event.storeId}`;
    await this.cacheService.delete(cacheKey);
    logger.debug('Cache invalidated for inventory update:', { cacheKey });
  }

  private async handleStockReserved(event: StockReservedEvent): Promise<void> {
    const cacheKey = `availability:${event.productId}:${event.storeId}`;
    await this.cacheService.delete(cacheKey);
    logger.debug('Cache invalidated for stock reservation:', { cacheKey });
  }

  private async handleStockReleased(event: StockReleasedEvent): Promise<void> {
    const cacheKey = `availability:${event.productId}:${event.storeId}`;
    await this.cacheService.delete(cacheKey);
    logger.debug('Cache invalidated for stock release:', { cacheKey });
  }

  private async handleSaleConfirmed(event: SaleConfirmedEvent): Promise<void> {
    const cacheKey = `availability:${event.productId}:${event.storeId}`;
    await this.cacheService.delete(cacheKey);
    logger.debug('Cache invalidated for sale confirmation:', { cacheKey });
  }
}
