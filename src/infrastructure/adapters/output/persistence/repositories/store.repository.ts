import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { Store } from '@domain/models/store.model';
import { StoreEntity } from '../entities/store.entity';

@injectable()
export class StoreRepository implements StoreRepositoryPort {
  private repository: Repository<StoreEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(StoreEntity);
  }

  async save(store: Store): Promise<Store> {
    const entity = this.domainToEntity(store);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findById(id: string): Promise<Store | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByCode(code: string): Promise<Store | null> {
    const entity = await this.repository.findOne({ where: { code } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findAll(page: number, size: number): Promise<{ data: Store[]; total: number }> {
    const validPage = Math.max(1, page);
    const [entities, total] = await this.repository.findAndCount({
      skip: (validPage - 1) * size,
      take: size,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entities.map((e) => this.entityToDomain(e)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private domainToEntity(domain: Store): StoreEntity {
    const entity = new StoreEntity();
    entity.id = domain.id;
    entity.code = domain.code;
    entity.name = domain.name;
    entity.address = domain.address;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  private entityToDomain(entity: StoreEntity): Store {
    return new Store(
      entity.id,
      entity.code,
      entity.name,
      entity.address,
      entity.createdAt,
      entity.updatedAt
    );
  }
}
