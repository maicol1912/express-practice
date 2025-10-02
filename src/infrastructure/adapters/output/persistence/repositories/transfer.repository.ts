import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { TransferRepositoryPort } from '@domain/ports/out/transfer-repository.port';
import { Transfer, TransferStatus } from '@domain/models/transfer.model';
import { TransferEntity } from '../entities/transfer.entity';

@injectable()
export class TransferRepository implements TransferRepositoryPort {
  private repository: Repository<TransferEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(TransferEntity);
  }

  async save(transfer: Transfer): Promise<Transfer> {
    const entity = this.domainToEntity(transfer);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findById(id: string): Promise<Transfer | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findAll(
    storeId?: string,
    productId?: string,
    status?: TransferStatus
  ): Promise<Transfer[]> {
    const queryBuilder = this.repository.createQueryBuilder('transfer');

    if (storeId) {
      queryBuilder.where(
        '(transfer.fromStoreId = :storeId OR transfer.toStoreId = :storeId)',
        { storeId }
      );
    }

    if (productId) {
      queryBuilder.andWhere('transfer.productId = :productId', { productId });
    }

    if (status) {
      queryBuilder.andWhere('transfer.status = :status', { status });
    }

    queryBuilder.orderBy('transfer.requestedAt', 'DESC');

    const entities = await queryBuilder.getMany();
    return entities.map((e) => this.entityToDomain(e));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private domainToEntity(domain: Transfer): TransferEntity {
    const entity = new TransferEntity();
    entity.id = domain.id;
    entity.fromStoreId = domain.fromStoreId;
    entity.toStoreId = domain.toStoreId;
    entity.productId = domain.productId;
    entity.qty = domain.qty;
    entity.status = domain.status;
    entity.requestedBy = domain.requestedBy;
    entity.approvedBy = domain.approvedBy;
    entity.requestedAt = domain.requestedAt;
    entity.startedAt = domain.startedAt;
    entity.completedAt = domain.completedAt;
    return entity;
  }

  private entityToDomain(entity: TransferEntity): Transfer {
    return new Transfer(
      entity.id,
      entity.fromStoreId,
      entity.toStoreId,
      entity.productId,
      entity.qty,
      entity.status as TransferStatus,
      entity.requestedBy,
      entity.approvedBy,
      entity.requestedAt,
      entity.startedAt,
      entity.completedAt
    );
  }
}
