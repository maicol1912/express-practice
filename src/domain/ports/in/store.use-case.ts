import { Store } from '../../models/store.model';

export interface StoreUseCase {
  create(code: string, name: string, address: string): Promise<Store>;

  findById(id: string): Promise<Store>;

  findAll(page: number, size: number): Promise<{ data: Store[]; total: number }>;

  update(id: string, code?: string, name?: string, address?: string): Promise<Store>;

  delete(id: string): Promise<void>;
}
