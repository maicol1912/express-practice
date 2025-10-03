import "reflect-metadata"
import { InventoryService } from '@application/services/inventory.service';
import { NotFoundException } from '@domain/exceptions/domain.exception';
import { MockRepositories } from '../../utils/mocks';
import { TestFactories } from '../../utils/factories';
import { mock } from 'jest-mock-extended';

describe('InventoryService - Unit Tests', () => {
    let inventoryService: InventoryService;
    let inventoryRepository: any;
    let productRepository: any;
    let storeRepository: any;
    let transactionRepository: any;
    let eventPublisher: any;
    let cacheService: any;

    beforeEach(() => {
        inventoryRepository = MockRepositories.inventoryRepository();
        productRepository = MockRepositories.productRepository();
        storeRepository = MockRepositories.storeRepository();
        transactionRepository = mock<any>();
        eventPublisher = MockRepositories.eventPublisher();
        cacheService = MockRepositories.cache();

        inventoryService = new InventoryService(
            inventoryRepository,
            productRepository,
            storeRepository,
            transactionRepository,
            eventPublisher,
            cacheService
        );
    });

    describe('adjustStock', () => {
        it('should adjust stock for existing inventory', async () => {
            const store = TestFactories.createStore();
            const product = TestFactories.createProduct();
            const inventory = TestFactories.createInventoryItem({
                productId: product.id,
                storeId: store.id,
                onHand: 100,
                available: 80
            });

            storeRepository.findById.mockResolvedValue(store);
            productRepository.findById.mockResolvedValue(product);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            inventoryRepository.save.mockResolvedValue(inventory);
            transactionRepository.save.mockResolvedValue({});

            const result = await inventoryService.adjustStock(
                store.id,
                product.id,
                10,
                'admin-user'
            );

            expect(result).toBeDefined();
            expect(inventoryRepository.save).toHaveBeenCalled();
            expect(eventPublisher.publish).toHaveBeenCalled();
        });

        it('should throw NotFoundException for invalid store', async () => {
            storeRepository.findById.mockResolvedValue(null);

            await expect(
                inventoryService.adjustStock('invalid-store', 'product-id', 10, 'user')
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('restock', () => {
        it('should restock inventory successfully', async () => {
            const store = TestFactories.createStore();
            const product = TestFactories.createProduct();
            const inventory = TestFactories.createInventoryItem({
                productId: product.id,
                storeId: store.id,
                onHand: 50,
                available: 50
            });

            storeRepository.findById.mockResolvedValue(store);
            productRepository.findById.mockResolvedValue(product);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            inventoryRepository.save.mockImplementation((inv: any) => Promise.resolve(inv));
            transactionRepository.save.mockResolvedValue({});

            const result = await inventoryService.restock(
                store.id,
                product.id,
                100,
                'admin-user'
            );

            expect(result.onHand).toBe(150);
            expect(result.available).toBe(150);
        });
    });
});