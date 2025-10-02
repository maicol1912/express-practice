import { injectable, inject } from 'tsyringe';
import { StoreUseCase } from '@domain/ports/in/store.use-case';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { Store } from '@domain/models/store.model';
import { NotFoundException, AlreadyExistsException } from '@domain/exceptions/domain.exception';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@infrastructure/config/logger.config';

@injectable()
export class StoreService implements StoreUseCase {
  constructor(@inject('StoreRepositoryPort') private storeRepository: StoreRepositoryPort) { }

  async create(code: string, name: string, address: string): Promise<Store> {
    logger.info('Creating store', { code, name });

    const existing = await this.storeRepository.findByCode(code);
    if (existing) {
      throw new AlreadyExistsException('Store', 'code', code);
    }

    const store = new Store(uuidv4(), code, name, address, new Date(), new Date());
    return this.storeRepository.save(store);
  }

  async findById(id: string): Promise<Store> {
    const store = await this.storeRepository.findById(id);
    if (!store) {
      throw new NotFoundException('Store', 'id', id);
    }
    return store;
  }

  async findAll(page: number, size: number): Promise<{ data: Store[]; total: number }> {
    return this.storeRepository.findAll(page, size);
  }

  async update(id: string, code?: string, name?: string, address?: string): Promise<Store> {
    const store = await this.findById(id);

    if (code && code !== store.code) {
      const existing = await this.storeRepository.findByCode(code);
      if (existing) {
        throw new AlreadyExistsException('Store', 'code', code);
      }
      store.code = code;
    }

    if (name !== undefined) store.name = name;
    if (address !== undefined) store.address = address;
    store.updatedAt = new Date();

    return this.storeRepository.save(store);
  }

  async delete(id: string): Promise<void> {
    const store = await this.findById(id);
    await this.storeRepository.delete(store.id);
    logger.info('Store deleted', { id });
  }
}
