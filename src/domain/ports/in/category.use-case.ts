import { Category } from '../../models/category.model';

export interface CategoryUseCase {
  create(name: string, description: string | null): Promise<Category>;

  findById(id: string): Promise<Category>;

  findAll(page: number, size: number): Promise<{ data: Category[]; total: number }>;

  update(id: string, name?: string, description?: string | null): Promise<Category>;

  delete(id: string): Promise<void>;
}
