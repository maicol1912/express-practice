import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { ProductRepositoryPort } from '@domain/ports/out/product-repository.port';
import { Product } from '@domain/models/product.model';
import { ProductEntity } from '../entities/product.entity';

@injectable()
export class ProductRepository implements ProductRepositoryPort {
  private repository: Repository<ProductEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(ProductEntity);
  }

  async save(product: Product): Promise<Product> {
    const entity = this.domainToEntity(product);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { sku } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findAll(page: number, size: number): Promise<{ data: Product[]; total: number }> {
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

  private domainToEntity(domain: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = domain.id;
    entity.sku = domain.sku;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.categoryId = domain.categoryId;
    entity.price = domain.price;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  private entityToDomain(entity: ProductEntity): Product {
    return new Product(
      entity.id,
      entity.sku,
      entity.name,
      entity.description,
      entity.categoryId,
      entity.price,
      entity.createdAt,
      entity.updatedAt
    );
  }
}
