import { Transfer, TransferStatus } from '@domain/models/transfer.model';

describe('Transfer Model - Unit Tests', () => {
    describe('canStart', () => {
        it('should return true for pending transfer', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.PENDING,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            expect(transfer.canStart()).toBe(true);
        });

        it('should return false for non-pending transfer', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.IN_TRANSIT,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            expect(transfer.canStart()).toBe(false);
        });
    });

    describe('canComplete', () => {
        it('should return true for in-transit transfer', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.IN_TRANSIT,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            expect(transfer.canComplete()).toBe(true);
        });

        it('should return false for pending transfer', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.PENDING,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            expect(transfer.canComplete()).toBe(false);
        });
    });

    describe('canFail', () => {
        it('should return true for pending or in-transit', () => {
            const pendingTransfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.PENDING,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            const inTransitTransfer = new Transfer(
                'trans-2',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.IN_TRANSIT,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            expect(pendingTransfer.canFail()).toBe(true);
            expect(inTransitTransfer.canFail()).toBe(true);
        });

        it('should return false for completed transfer', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.COMPLETED,
                'admin',
                'admin',
                new Date(),
                new Date(),
                new Date()
            );

            expect(transfer.canFail()).toBe(false);
        });
    });

    describe('start', () => {
        it('should update transfer to in-transit', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.PENDING,
                'admin',
                null,
                new Date(),
                null,
                null
            );

            transfer.start('approver');

            expect(transfer.status).toBe(TransferStatus.IN_TRANSIT);
            expect(transfer.approvedBy).toBe('approver');
            expect(transfer.startedAt).toBeDefined();
        });
    });

    describe('complete', () => {
        it('should update transfer to completed', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.IN_TRANSIT,
                'admin',
                null,
                new Date(),
                new Date(),
                null
            );

            transfer.complete('approver');

            expect(transfer.status).toBe(TransferStatus.COMPLETED);
            expect(transfer.approvedBy).toBe('approver');
            expect(transfer.completedAt).toBeDefined();
        });
    });

    describe('fail', () => {
        it('should update transfer to failed', () => {
            const transfer = new Transfer(
                'trans-1',
                'store-1',
                'store-2',
                'prod-1',
                50,
                TransferStatus.IN_TRANSIT,
                'admin',
                null,
                new Date(),
                new Date(),
                null
            );

            transfer.fail('approver');

            expect(transfer.status).toBe(TransferStatus.FAILED);
            expect(transfer.approvedBy).toBe('approver');
            expect(transfer.completedAt).toBeDefined();
        });
    });
});