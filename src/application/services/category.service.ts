import { injectable, inject } from 'tsyringe';
import { CategoryUseCase } from '@domain/ports/in/category.use-case';
import { CategoryRepositoryPort } from '@domain/ports/out/category-repository.port';
import { Category } from '@domain/models/category.model';
import { NotFoundException, AlreadyExistsException } from '@domain/exceptions/domain.exception';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';
import { IsolationLevel, Transactional } from 'typeorm-transactional';

@injectable()
export class CategoryService implements CategoryUseCase {
  constructor(@inject('CategoryRepositoryPort') private categoryRepository: CategoryRepositoryPort) { }

  async create(name: string, description: string | null): Promise<Category> {
    logger.info('Creating category', { name });

    const existing = await this.categoryRepository.findByName(name);
    if (existing) {
      throw new AlreadyExistsException('Category', 'name', name);
    }

    const category = new Category(uuidv4(), name, description, new Date(), new Date());
    return this.categoryRepository.save(category);
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category', 'id', id);
    }
    return category;
  }

  async findAll(page: number, size: number): Promise<{ data: Category[]; total: number }> {
    return this.categoryRepository.findAll(page, size);
  }

  @Transactional({ isolationLevel: IsolationLevel.READ_COMMITTED })
  async update(id: string, name?: string, description?: string | null): Promise<Category> {
    const category = await this.findById(id);

    if (name && name !== category.name) {
      const existing = await this.categoryRepository.findByName(name);
      if (existing) {
        throw new AlreadyExistsException('Category', 'name', name);
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    category.updatedAt = new Date();

    return this.categoryRepository.save(category);
  }

  async delete(id: string): Promise<void> {
    const category = await this.findById(id);
    await this.categoryRepository.delete(category.id);
    logger.info('Category deleted', { id });
  }
}
