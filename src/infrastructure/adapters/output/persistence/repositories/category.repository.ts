import { injectable } from 'tsyringe';
import { Repository } from 'typeorm';
import { AppDataSource } from '@infrastructure/config/database.config';
import { CategoryRepositoryPort } from '@domain/ports/out/category-repository.port';
import { Category } from '@domain/models/category.model';
import { CategoryEntity } from '../entities/category.entity';

@injectable()
export class CategoryRepository implements CategoryRepositoryPort {
  private repository: Repository<CategoryEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(CategoryEntity);
  }

  async save(category: Category): Promise<Category> {
    const entity = this.domainToEntity(category);
    const saved = await this.repository.save(entity);
    return this.entityToDomain(saved);
  }

  async findById(id: string): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.entityToDomain(entity) : null;
  }

  async findAll(page: number, size: number): Promise<{ data: Category[]; total: number }> {
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

  private domainToEntity(domain: Category): CategoryEntity {
    const entity = new CategoryEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  private entityToDomain(entity: CategoryEntity): Category {
    return new Category(
      entity.id,
      entity.name,
      entity.description,
      entity.createdAt,
      entity.updatedAt
    );
  }
}
