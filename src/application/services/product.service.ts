import { injectable, inject } from 'tsyringe';
import { ProductUseCase } from '@domain/ports/in/product.use-case';
import { ProductRepositoryPort } from '@domain/ports/out/product-repository.port';
import { CategoryRepositoryPort } from '@domain/ports/out/category-repository.port';
import { Product } from '@domain/models/product.model';
import { NotFoundException, AlreadyExistsException } from '@domain/exceptions/domain.exception';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class ProductService implements ProductUseCase {
  constructor(
    @inject('ProductRepositoryPort') private productRepository: ProductRepositoryPort,
    @inject('CategoryRepositoryPort') private categoryRepository: CategoryRepositoryPort
  ) { }

  async create(
    sku: string,
    name: string,
    description: string | null,
    categoryId: string,
    price: number
  ): Promise<Product> {
    logger.info('Creating product', { sku, name, categoryId });

    // Check if SKU already exists
    const existing = await this.productRepository.findBySku(sku);
    if (existing) {
      throw new AlreadyExistsException('Product', 'sku', sku);
    }

    // Validate category exists
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException('Category', 'id', categoryId);
    }

    const product = new Product(
      uuidv4(),
      sku,
      name,
      description,
      categoryId,
      price,
      new Date(),
      new Date()
    );

    return this.productRepository.save(product);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product', 'id', id);
    }
    return product;
  }

  async findAll(page: number, size: number): Promise<{ data: Product[]; total: number }> {
    return this.productRepository.findAll(page, size);
  }

  async update(
    id: string,
    sku?: string,
    name?: string,
    description?: string | null,
    categoryId?: string,
    price?: number
  ): Promise<Product> {
    const product = await this.findById(id);

    if (sku && sku !== product.sku) {
      const existing = await this.productRepository.findBySku(sku);
      if (existing) {
        throw new AlreadyExistsException('Product', 'sku', sku);
      }
      product.sku = sku;
    }

    if (categoryId && categoryId !== product.categoryId) {
      const category = await this.categoryRepository.findById(categoryId);
      if (!category) {
        throw new NotFoundException('Category', 'id', categoryId);
      }
      product.categoryId = categoryId;
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    product.updatedAt = new Date();

    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    const product = await this.findById(id);
    await this.productRepository.delete(product.id);
    logger.info('Product deleted', { id });
  }
}
