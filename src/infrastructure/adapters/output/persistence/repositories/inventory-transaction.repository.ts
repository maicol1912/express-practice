import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { InventoryTransactionRepositoryPort } from '@domain/ports/out/inventory-transaction-repository.port';
import { InventoryTransaction, TransactionType } from '@domain/models/inventory-transaction.model';
import { InventoryTransactionEntity } from '../entities/inventory-transaction.entity';

@injectable()
export class InventoryTransactionRepository implements InventoryTransactionRepositoryPort {
  private repository: Repository<InventoryTransactionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(InventoryTransactionEntity);
  }

  async save(transaction: InventoryTransaction): Promise<InventoryTransaction> {
    const entity = this.domainToEntity(transaction);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findByInventoryItem(inventoryItemId: string): Promise<InventoryTransaction[]> {
    const entities = await this.repository.find({
      where: { inventoryItemId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.entityToDomain(e));
  }

  async findByStore(storeId: string, limit?: number): Promise<InventoryTransaction[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('transaction')
      .where('transaction.storeId = :storeId', { storeId })
      .orderBy('transaction.createdAt', 'DESC');

    if (limit) {
      queryBuilder.take(limit);
    }

    const entities = await queryBuilder.getMany();
    return entities.map((e) => this.entityToDomain(e));
  }

  private domainToEntity(domain: InventoryTransaction): InventoryTransactionEntity {
    const entity = new InventoryTransactionEntity();
    entity.id = domain.id;
    entity.inventoryItemId = domain.inventoryItemId;
    entity.productId = domain.productId;
    entity.storeId = domain.storeId;
    entity.type = domain.type;
    entity.quantity = domain.quantity;
    entity.balanceAfter = domain.balanceAfter;
    entity.actor = domain.actor;
    entity.referenceId = domain.referenceId;
    entity.notes = domain.notes;
    entity.createdAt = domain.createdAt;
    return entity;
  }

  private entityToDomain(entity: InventoryTransactionEntity): InventoryTransaction {
    return new InventoryTransaction(
      entity.id,
      entity.inventoryItemId,
      entity.productId,
      entity.storeId,
      entity.type as TransactionType,
      entity.quantity,
      entity.balanceAfter,
      entity.actor,
      entity.referenceId,
      entity.notes,
      entity.createdAt
    );
  }
}
