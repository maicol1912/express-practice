import 'reflect-metadata';
import { container } from 'tsyringe';

// Repository Ports
import { UserRepositoryPort } from '@domain/ports/out/user-repository.port';
import { ProductRepositoryPort } from '@domain/ports/out/product-repository.port';
import { CategoryRepositoryPort } from '@domain/ports/out/category-repository.port';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { InventoryRepositoryPort } from '@domain/ports/out/inventory-repository.port';
import { ReservationRepositoryPort } from '@domain/ports/out/reservation-repository.port';
import { TransferRepositoryPort } from '@domain/ports/out/transfer-repository.port';
import { RoleRepositoryPort } from '@domain/ports/out/role-repository.port';
import { InventoryTransactionRepositoryPort } from '@domain/ports/out/inventory-transaction-repository.port';

// Repository Implementations
import { UserRepository } from '@infrastructure/adapters/output/persistence/repositories/user.repository';
import { ProductRepository } from '@infrastructure/adapters/output/persistence/repositories/product.repository';
import { CategoryRepository } from '@infrastructure/adapters/output/persistence/repositories/category.repository';
import { StoreRepository } from '@infrastructure/adapters/output/persistence/repositories/store.repository';
import { InventoryItemRepository } from '@infrastructure/adapters/output/persistence/repositories/inventory-item.repository';
import { ReservationRepository } from '@infrastructure/adapters/output/persistence/repositories/reservation.repository';
import { TransferRepository } from '@infrastructure/adapters/output/persistence/repositories/transfer.repository';
import { RoleRepository } from '@infrastructure/adapters/output/persistence/repositories/role.repository';
import { InventoryTransactionRepository } from '@infrastructure/adapters/output/persistence/repositories/inventory-transaction.repository';

import { AuthenticationUseCase } from '@domain/ports/in/authentication.use-case';
import { UserUseCase } from '@domain/ports/in/user.use-case';
import { ProductUseCase } from '@domain/ports/in/product.use-case';
import { CategoryUseCase } from '@domain/ports/in/category.use-case';
import { StoreUseCase } from '@domain/ports/in/store.use-case';
import { InventoryUseCase } from '@domain/ports/in/inventory.use-case';
import { ReservationUseCase } from '@domain/ports/in/reservation.use-case';
import { TransferUseCase } from '@domain/ports/in/transfer.use-case';

// Other Ports
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { CachePort } from '@domain/ports/out/cache.port';

// Other Implementations
import { SpringEventPublisher } from '@infrastructure/adapters/output/event/spring-event-publisher';
import { RedisCacheService } from '@infrastructure/adapters/output/cache/redis-cache.service';
import { AuthenticationService, CategoryService, InventoryService, ProductService, ReservationService, StoreService, TransferService, UserService } from '@application/services';
// import { Category2Repository } from '@infrastructure/adapters/output/persistence/repositories/category2.repository';

/**
 * Configure dependency injection container
 * Register all repository implementations with their corresponding ports
 */
export function configureDependencyInjection(): void {
  // Register repositories
  container.register<UserRepositoryPort>('UserRepositoryPort', {
    useClass: UserRepository,
  });

  container.register<ProductRepositoryPort>('ProductRepositoryPort', {
    useClass: ProductRepository,
  });

  container.register<CategoryRepositoryPort>('CategoryRepositoryPort', {
    useClass: CategoryRepository,
  });

  container.register<StoreRepositoryPort>('StoreRepositoryPort', {
    useClass: StoreRepository,
  });

  container.register<InventoryRepositoryPort>('InventoryRepositoryPort', {
    useClass: InventoryItemRepository,
  });

  container.register<ReservationRepositoryPort>('ReservationRepositoryPort', {
    useClass: ReservationRepository,
  });

  container.register<TransferRepositoryPort>('TransferRepositoryPort', {
    useClass: TransferRepository,
  });

  container.register<RoleRepositoryPort>('RoleRepositoryPort', {
    useClass: RoleRepository,
  });

  container.register<InventoryTransactionRepositoryPort>('InventoryTransactionRepositoryPort', {
    useClass: InventoryTransactionRepository,
  });

  // Register event publisher
  container.register<EventPublisherPort>('EventPublisherPort', {
    useClass: SpringEventPublisher,
  });

  // Register cache service
  container.register<CachePort>('CachePort', {
    useClass: RedisCacheService,
  });

  container.register<AuthenticationUseCase>('AuthenticationUseCase', {
    useClass: AuthenticationService,
  });


  container.register<UserUseCase>('UserUseCase', {
    useClass: UserService,
  });

  container.register<ProductUseCase>('ProductUseCase', {
    useClass: ProductService,
  });

  container.register<CategoryUseCase>('CategoryUseCase', {
    useClass: CategoryService,
  });

  container.register<StoreUseCase>('StoreUseCase', {
    useClass: StoreService,
  });

  container.register<InventoryUseCase>('InventoryUseCase', {
    useClass: InventoryService,
  });

  container.register<ReservationUseCase>('ReservationUseCase', {
    useClass: ReservationService,
  });

  container.register<TransferUseCase>('TransferUseCase', {
    useClass: TransferService,
  });
}
