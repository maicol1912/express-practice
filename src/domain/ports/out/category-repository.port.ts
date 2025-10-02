import { Category } from '../../models/category.model';

export interface CategoryRepositoryPort {
  save(category: Category): Promise<Category>;

  findById(id: string): Promise<Category | null>;

  findByName(name: string): Promise<Category | null>;

  findAll(page: number, size: number): Promise<{ data: Category[]; total: number }>;

  delete(id: string): Promise<void>;
}
