import { InventoryItem } from '@domain/models/inventory-item.model';
import { SyncStatus } from '@domain/value-objects/stock-availability.vo';
import { InventoryInconsistencyException } from '@domain/exceptions/domain.exception';

describe('InventoryItem Model - Unit Tests', () => {
    describe('isConsistent', () => {
        it('should return true for consistent inventory', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100, // onHand
                70,  // available
                20,  // reserved
                10,  // committed
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            expect(inventory.isConsistent()).toBe(true);
        });

        it('should return false for inconsistent inventory', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                80,
                20,
                10,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            expect(inventory.isConsistent()).toBe(false);
        });
    });

    describe('canReserve', () => {
        it('should return true when enough stock available', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                80,
                20,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            expect(inventory.canReserve(50)).toBe(true);
        });

        it('should return false when insufficient stock', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                10,
                90,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            expect(inventory.canReserve(50)).toBe(false);
        });
    });

    describe('reserveStock', () => {
        it('should reserve stock correctly', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                80,
                20,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            inventory.reserveStock(30);

            expect(inventory.available).toBe(50);
            expect(inventory.reserved).toBe(50);
        });

        it('should throw error when reserving more than available', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                20,
                80,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            expect(() => inventory.reserveStock(50)).toThrow(InventoryInconsistencyException);
        });
    });

    describe('confirmSale', () => {
        it('should confirm sale correctly', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                70,
                30,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            inventory.confirmSale(20);

            expect(inventory.reserved).toBe(10);
            expect(inventory.committed).toBe(20);
            expect(inventory.onHand).toBe(80);
        });
    });

    describe('addStock', () => {
        it('should add stock correctly', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                80,
                20,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            inventory.addStock(50);

            expect(inventory.onHand).toBe(150);
            expect(inventory.available).toBe(130);
        });
    });

    describe('adjustStock', () => {
        it('should increase stock correctly', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                80,
                20,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            inventory.adjustStock(30);

            expect(inventory.onHand).toBe(130);
            expect(inventory.available).toBe(110);
        });

        it('should decrease stock correctly', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                100,
                80,
                20,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            inventory.adjustStock(-30);

            expect(inventory.onHand).toBe(70);
            expect(inventory.available).toBe(50);
        });

        it('should throw error for negative result', () => {
            const inventory = new InventoryItem(
                'id-1',
                'prod-1',
                'store-1',
                50,
                30,
                20,
                0,
                0,
                0,
                SyncStatus.SYNCED,
                null,
                new Date(),
                new Date(),
                'admin'
            );

            expect(() => inventory.adjustStock(-60)).toThrow(InventoryInconsistencyException);
        });
    });
});