import { Store } from '../../models/store.model';

export interface StoreRepositoryPort {
  save(store: Store): Promise<Store>;

  findById(id: string): Promise<Store | null>;

  findByCode(code: string): Promise<Store | null>;

  findAll(page: number, size: number): Promise<{ data: Store[]; total: number }>;

  delete(id: string): Promise<void>;
}
