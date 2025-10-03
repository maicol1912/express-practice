import "reflect-metadata"
import { NotFoundException, InvalidStateException } from '@domain/exceptions/domain.exception';
import { MockRepositories } from '../../utils/mocks';
import { TestFactories } from '../../utils/factories';
import { mock } from 'jest-mock-extended';
import { TransferStatus } from '@domain/models/transfer.model';
import { TransferService } from '@application/services';

describe('TransferService - Unit Tests', () => {
    let transferService: TransferService;
    let transferRepository: any;
    let inventoryRepository: any;
    let storeRepository: any;
    let productRepository: any;
    let transactionRepository: any;
    let eventPublisher: any;

    beforeEach(() => {
        transferRepository = mock<any>();
        inventoryRepository = MockRepositories.inventoryRepository();
        storeRepository = MockRepositories.storeRepository();
        productRepository = MockRepositories.productRepository();
        transactionRepository = mock<any>();
        eventPublisher = MockRepositories.eventPublisher();

        transferService = new TransferService(
            transferRepository,
            inventoryRepository,
            storeRepository,
            productRepository,
            transactionRepository,
            eventPublisher
        );
    });

    describe('createTransfer', () => {
        it('should create transfer successfully', async () => {
            const fromStore = TestFactories.createStore({ id: 'store-1' });
            const toStore = TestFactories.createStore({ id: 'store-2' });
            const product = TestFactories.createProduct();
            const inventory = TestFactories.createInventoryItem({
                storeId: fromStore.id,
                productId: product.id,
                available: 100
            });

            storeRepository.findById.mockImplementation((id: string) => {
                if (id === fromStore.id) return Promise.resolve(fromStore);
                if (id === toStore.id) return Promise.resolve(toStore);
                return Promise.resolve(null);
            });
            productRepository.findById.mockResolvedValue(product);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            transferRepository.save.mockImplementation((t: any) => Promise.resolve(t));

            const result = await transferService.createTransfer(
                fromStore.id,
                toStore.id,
                product.id,
                50,
                'admin-user'
            );

            expect(result.status).toBe(TransferStatus.PENDING);
            expect(result.qty).toBe(50);
            expect(transferRepository.save).toHaveBeenCalled();
            expect(eventPublisher.publish).toHaveBeenCalled();
        });

        it('should throw InvalidStateException for same store transfer', async () => {
            await expect(
                transferService.createTransfer('store-1', 'store-1', 'prod-1', 10, 'user')
            ).rejects.toThrow(InvalidStateException);
        });

        it('should throw InvalidStateException for negative quantity', async () => {
            await expect(
                transferService.createTransfer('store-1', 'store-2', 'prod-1', -10, 'user')
            ).rejects.toThrow(InvalidStateException);
        });

        it('should throw NotFoundException for invalid store', async () => {
            storeRepository.findById.mockResolvedValue(null);

            await expect(
                transferService.createTransfer('invalid', 'store-2', 'prod-1', 10, 'user')
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw InvalidStateException for insufficient stock', async () => {
            const fromStore = TestFactories.createStore({ id: 'store-1' });
            const toStore = TestFactories.createStore({ id: 'store-2' });
            const product = TestFactories.createProduct();
            const inventory = TestFactories.createInventoryItem({
                storeId: fromStore.id,
                productId: product.id,
                available: 5
            });

            storeRepository.findById.mockImplementation((id: string) => {
                if (id === fromStore.id) return Promise.resolve(fromStore);
                if (id === toStore.id) return Promise.resolve(toStore);
                return Promise.resolve(null);
            });
            productRepository.findById.mockResolvedValue(product);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);

            await expect(
                transferService.createTransfer(fromStore.id, toStore.id, product.id, 50, 'user')
            ).rejects.toThrow(InvalidStateException);
        });
    });

    describe('startTransfer', () => {
        it('should start transfer successfully', async () => {
            const transfer = TestFactories.createTransfer({
                status: TransferStatus.PENDING,
                qty: 50
            });

            const inventory = TestFactories.createInventoryItem({
                storeId: transfer.fromStoreId,
                productId: transfer.productId,
                available: 100
            });

            transferRepository.findById.mockResolvedValue(transfer);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});
            transferRepository.save.mockImplementation((t: any) => Promise.resolve(t));

            const result = await transferService.startTransfer(transfer.id, 'admin-user');

            expect(result.status).toBe(TransferStatus.IN_TRANSIT);
            expect(eventPublisher.publish).toHaveBeenCalled();
        });

        it('should throw NotFoundException when transfer not found', async () => {
            transferRepository.findById.mockResolvedValue(null);

            await expect(
                transferService.startTransfer('non-existent', 'user')
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw InvalidStateException for non-pending transfer', async () => {
            const transfer = TestFactories.createTransfer({
                status: TransferStatus.COMPLETED
            });

            transferRepository.findById.mockResolvedValue(transfer);

            await expect(
                transferService.startTransfer(transfer.id, 'user')
            ).rejects.toThrow(InvalidStateException);
        });
    });

    describe('completeTransfer', () => {
        it('should complete transfer successfully', async () => {
            const transfer = TestFactories.createTransfer({
                status: TransferStatus.IN_TRANSIT,
                qty: 50
            });

            const sourceInventory = TestFactories.createInventoryItem({
                storeId: transfer.fromStoreId,
                productId: transfer.productId,
                onHand: 100,
                reserved: 50
            });

            const destInventory = TestFactories.createInventoryItem({
                storeId: transfer.toStoreId,
                productId: transfer.productId,
                onHand: 50
            });

            transferRepository.findById.mockResolvedValue(transfer);
            inventoryRepository.findByProductAndStore.mockImplementation((_prodId: any, storeId: any) => {
                if (storeId === transfer.fromStoreId) return Promise.resolve(sourceInventory);
                if (storeId === transfer.toStoreId) return Promise.resolve(destInventory);
                return Promise.resolve(null);
            });
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});
            transferRepository.save.mockImplementation((t: any) => Promise.resolve(t));

            const result = await transferService.completeTransfer(transfer.id, 'admin-user');

            expect(result.status).toBe(TransferStatus.COMPLETED);
            expect(result.completedAt).toBeDefined();
            expect(eventPublisher.publish).toHaveBeenCalledTimes(3);
        });

        it('should create destination inventory if not exists', async () => {
            const transfer = TestFactories.createTransfer({
                status: TransferStatus.IN_TRANSIT,
                qty: 50
            });

            const sourceInventory = TestFactories.createInventoryItem({
                storeId: transfer.fromStoreId,
                productId: transfer.productId,
                onHand: 100,
                reserved: 50
            });

            transferRepository.findById.mockResolvedValue(transfer);
            inventoryRepository.findByProductAndStore.mockImplementation((_prodId: any, storeId: any) => {
                if (storeId === transfer.fromStoreId) return Promise.resolve(sourceInventory);
                if (storeId === transfer.toStoreId) return Promise.resolve(null);
                return Promise.resolve(null);
            });
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});
            transferRepository.save.mockImplementation((t: any) => Promise.resolve(t));

            const result = await transferService.completeTransfer(transfer.id, 'admin-user');

            expect(result.status).toBe(TransferStatus.COMPLETED);
            expect(inventoryRepository.save).toHaveBeenCalledTimes(2);
        });
    });

    describe('failTransfer', () => {
        it('should fail transfer and release stock', async () => {
            const transfer = TestFactories.createTransfer({
                status: TransferStatus.IN_TRANSIT,
                qty: 50
            });

            const inventory = TestFactories.createInventoryItem({
                storeId: transfer.fromStoreId,
                productId: transfer.productId,
                onHand: 100,
                reserved: 50
            });

            transferRepository.findById.mockResolvedValue(transfer);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});
            transferRepository.save.mockImplementation((t: any) => Promise.resolve(t));

            const result = await transferService.failTransfer(transfer.id, 'admin-user');

            expect(result.status).toBe(TransferStatus.FAILED);
            expect(inventoryRepository.save).toHaveBeenCalled();
        });

        it('should throw InvalidStateException for completed transfer', async () => {
            const transfer = TestFactories.createTransfer({
                status: TransferStatus.COMPLETED
            });

            transferRepository.findById.mockResolvedValue(transfer);

            await expect(
                transferService.failTransfer(transfer.id, 'user')
            ).rejects.toThrow(InvalidStateException);
        });
    });

    describe('listTransfers', () => {
        it('should list all transfers', async () => {
            const transfers = [
                TestFactories.createTransfer(),
                TestFactories.createTransfer()
            ];

            transferRepository.findAll.mockResolvedValue(transfers);

            const result = await transferService.listTransfers();

            expect(result).toHaveLength(2);
            expect(transferRepository.findAll).toHaveBeenCalledWith(undefined, undefined, undefined);
        });

        it('should list transfers by store', async () => {
            const store = TestFactories.createStore();
            const transfers = [TestFactories.createTransfer({ fromStoreId: store.id })];

            storeRepository.findById.mockResolvedValue(store);
            transferRepository.findAll.mockResolvedValue(transfers);

            const result = await transferService.listTransfers(store.id);

            expect(result).toHaveLength(1);
            expect(transferRepository.findAll).toHaveBeenCalledWith(store.id, undefined, undefined);
        });

        it('should throw NotFoundException for invalid store', async () => {
            storeRepository.findById.mockResolvedValue(null);

            await expect(
                transferService.listTransfers('invalid-store')
            ).rejects.toThrow(NotFoundException);
        });
    });
});
