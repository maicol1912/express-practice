import { Product } from '../../models/product.model';

export interface ProductRepositoryPort {
  save(product: Product): Promise<Product>;

  findById(id: string): Promise<Product | null>;

  findBySku(sku: string): Promise<Product | null>;

  findAll(page: number, size: number): Promise<{ data: Product[]; total: number }>;

  delete(id: string): Promise<void>;
}
