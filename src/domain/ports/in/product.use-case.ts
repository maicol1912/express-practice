import { Product } from '../../models/product.model';

export interface ProductUseCase {
  create(
    sku: string,
    name: string,
    description: string | null,
    categoryId: string,
    price: number
  ): Promise<Product>;

  findById(id: string): Promise<Product>;

  findAll(page: number, size: number): Promise<{ data: Product[]; total: number }>;

  update(
    id: string,
    sku?: string,
    name?: string,
    description?: string | null,
    categoryId?: string,
    price?: number
  ): Promise<Product>;

  delete(id: string): Promise<void>;
}
