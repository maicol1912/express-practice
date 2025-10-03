import { DataSource } from 'typeorm';
import { CategoryEntity } from '@infrastructure/adapters/output/persistence/entities/category.entity';
import { ProductEntity } from '@infrastructure/adapters/output/persistence/entities/product.entity';
import { StoreEntity } from '@infrastructure/adapters/output/persistence/entities/store.entity';
import { InventoryItemEntity } from '@infrastructure/adapters/output/persistence/entities/inventory-item.entity';

export class TestDataBuilder {
    constructor(private dataSource: DataSource) { }

    async createCategory(data: Partial<CategoryEntity> = {}): Promise<CategoryEntity> {
        const repository = this.dataSource.getRepository(CategoryEntity);
        const category = repository.create({
            name: data.name || 'Test Category',
            description: data.description || 'Test Description',
            ...data
        });
        return repository.save(category);
    }

    async createStore(data: Partial<StoreEntity> = {}): Promise<StoreEntity> {
        const repository = this.dataSource.getRepository(StoreEntity);
        const store = repository.create({
            code: data.code || 'TEST',
            name: data.name || 'Test Store',
            address: data.address || 'Test Address',
            ...data
        });
        return repository.save(store);
    }

    async createProduct(categoryId: string, data: Partial<ProductEntity> = {}): Promise<ProductEntity> {
        const repository = this.dataSource.getRepository(ProductEntity);
        const product = repository.create({
            sku: data.sku || 'TEST-SKU',
            name: data.name || 'Test Product',
            description: data.description || 'Test Description',
            categoryId,
            price: data.price || 99.99,
            ...data
        });
        return repository.save(product);
    }

    async createInventory(
        storeId: string,
        productId: string,
        data: Partial<InventoryItemEntity> = {}
    ): Promise<InventoryItemEntity> {
        const repository = this.dataSource.getRepository(InventoryItemEntity);
        const inventory = repository.create({
            storeId,
            productId,
            onHand: data.onHand || 100,
            available: data.available || 100,
            reserved: data.reserved || 0,
            committed: data.committed || 0,
            inTransit: data.inTransit || 0,
            version: 0,
            syncStatus: 'SYNCED',
            lastUpdatedBy: 'test-user',
            ...data
        });
        return repository.save(inventory);
    }
}