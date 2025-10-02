import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { InventoryRepositoryPort } from '@domain/ports/out/inventory-repository.port';
import { InventoryItem } from '@domain/models/inventory-item.model';
import { StockAvailability, SyncStatus } from '@domain/value-objects/stock-availability.vo';
import { InventoryItemEntity } from '../entities/inventory-item.entity';

@injectable()
export class InventoryItemRepository implements InventoryRepositoryPort {
  private repository: Repository<InventoryItemEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(InventoryItemEntity);
  }

  async save(item: InventoryItem): Promise<InventoryItem> {
    const entity = this.domainToEntity(item);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findByProductAndStore(
    productId: string,
    storeId: string,
    withLock: boolean = false
  ): Promise<InventoryItem | null> {
    let query = this.repository
      .createQueryBuilder('inventory')
      .where('inventory.productId = :productId', { productId })
      .andWhere('inventory.storeId = :storeId', { storeId });

    if (withLock) {
      query = query.setLock('pessimistic_write');
    }

    const entity = await query.getOne();
    return entity ? this.entityToDomain(entity) : null;
  }

  async findById(id: string): Promise<InventoryItem | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async listByStore(storeId: string): Promise<InventoryItem[]> {
    const entities = await this.repository.find({ where: { storeId } });
    return entities.map((e) => this.entityToDomain(e));
  }

  async findLowStock(storeId: string, threshold: number): Promise<InventoryItem[]> {
    const entities = await this.repository
      .createQueryBuilder('inventory')
      .where('inventory.storeId = :storeId', { storeId })
      .andWhere('inventory.available <= :threshold', { threshold })
      .getMany();

    return entities.map((e) => this.entityToDomain(e));
  }

  async getStockAvailability(
    productId: string,
    storeId: string
  ): Promise<StockAvailability | null> {
    const entity = await this.repository.findOne({
      where: { productId, storeId },
    });

    if (!entity) return null;

    return new StockAvailability(
      entity.productId,
      entity.storeId,
      entity.available,
      entity.reserved,
      entity.onHand,
      entity.committed,
      entity.inTransit,
      entity.syncStatus as SyncStatus,
      entity.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private domainToEntity(domain: InventoryItem): InventoryItemEntity {
    const entity = new InventoryItemEntity();
    entity.id = domain.id;
    entity.productId = domain.productId;
    entity.storeId = domain.storeId;
    entity.onHand = domain.onHand;
    entity.available = domain.available;
    entity.reserved = domain.reserved;
    entity.committed = domain.committed;
    entity.inTransit = domain.inTransit;
    entity.version = domain.version;
    entity.syncStatus = domain.syncStatus;
    entity.lastSyncAt = domain.lastSyncAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    entity.lastUpdatedBy = domain.lastUpdatedBy;
    return entity;
  }

  private entityToDomain(entity: InventoryItemEntity): InventoryItem {
    return new InventoryItem(
      entity.id,
      entity.productId,
      entity.storeId,
      entity.onHand,
      entity.available,
      entity.reserved,
      entity.committed,
      entity.inTransit,
      entity.version,
      entity.syncStatus as SyncStatus,
      entity.lastSyncAt,
      entity.createdAt,
      entity.updatedAt,
      entity.lastUpdatedBy
    );
  }
}
