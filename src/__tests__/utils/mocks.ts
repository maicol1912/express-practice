import { mock, MockProxy } from 'jest-mock-extended';
import { CategoryRepositoryPort } from '@domain/ports/out/category-repository.port';
import { ProductRepositoryPort } from '@domain/ports/out/product-repository.port';
import { StoreRepositoryPort } from '@domain/ports/out/store-repository.port';
import { InventoryRepositoryPort } from '@domain/ports/out/inventory-repository.port';
import { EventPublisherPort } from '@domain/ports/out/event-publisher.port';
import { CachePort } from '@domain/ports/out/cache.port';

export class MockRepositories {
    static categoryRepository(): MockProxy<CategoryRepositoryPort> {
        return mock<CategoryRepositoryPort>();
    }

    static productRepository(): MockProxy<ProductRepositoryPort> {
        return mock<ProductRepositoryPort>();
    }

    static storeRepository(): MockProxy<StoreRepositoryPort> {
        return mock<StoreRepositoryPort>();
    }

    static inventoryRepository(): MockProxy<InventoryRepositoryPort> {
        return mock<InventoryRepositoryPort>();
    }

    static eventPublisher(): MockProxy<EventPublisherPort> {
        return mock<EventPublisherPort>();
    }

    static cache(): MockProxy<CachePort> {
        return mock<CachePort>();
    }
}