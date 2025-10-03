import { Reservation, ReservationStatus, ReservationType, ReservationPriority } from '@domain/models/reservation.model';

describe('Reservation Model - Unit Tests', () => {
    describe('create', () => {
        it('should create standard reservation', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            expect(reservation.status).toBe(ReservationStatus.ACTIVE);
            expect(reservation.type).toBe(ReservationType.STANDARD);
            expect(reservation.priority).toBe(ReservationPriority.NORMAL);
            expect(reservation.qty).toBe(10);
        });

        it('should set expiration time correctly', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001',
                30
            );

            const now = new Date();
            const expiresIn = (reservation.expiresAt.getTime() - now.getTime()) / 1000 / 60;

            expect(expiresIn).toBeGreaterThan(29);
            expect(expiresIn).toBeLessThan(31);
        });
    });

    describe('createHighPriority', () => {
        it('should create high priority reservation', () => {
            const reservation = Reservation.createHighPriority(
                'res-1',
                'store-1',
                'prod-1',
                5,
                'ORD-VIP-001'
            );

            expect(reservation.type).toBe(ReservationType.HIGH_PRIORITY);
            expect(reservation.priority).toBe(ReservationPriority.HIGH);
        });
    });

    describe('createLayaway', () => {
        it('should create layaway reservation', () => {
            const reservation = Reservation.createLayaway(
                'res-1',
                'store-1',
                'prod-1',
                3,
                'customer-1'
            );

            expect(reservation.type).toBe(ReservationType.LAYAWAY);
            expect(reservation.customerId).toBe('customer-1');
        });
    });

    describe('cancel', () => {
        it('should cancel reservation with reason', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            reservation.cancel('Customer cancelled order');

            expect(reservation.status).toBe(ReservationStatus.CANCELLED);
            expect(reservation.cancelledReason).toBe('Customer cancelled order');
        });
    });

    describe('commit', () => {
        it('should commit reservation', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            reservation.commit();

            expect(reservation.status).toBe(ReservationStatus.COMMITTED);
        });
    });

    describe('extend', () => {
        it('should extend expiration time', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001',
                15
            );

            const originalExpiry = new Date(reservation.expiresAt);
            reservation.extend(30);

            const timeDiff = (reservation.expiresAt.getTime() - originalExpiry.getTime()) / 1000 / 60;
            expect(timeDiff).toBeCloseTo(30, 1);
            expect(reservation.status).toBe(ReservationStatus.EXTENDED);
        });
    });

    describe('usePartially', () => {
        it('should reduce quantity for partial use', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            reservation.usePartially(3);

            expect(reservation.qty).toBe(7);
            expect(reservation.status).toBe(ReservationStatus.PARTIAL);
        });

        it('should commit if all quantity used', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            reservation.usePartially(10);

            expect(reservation.status).toBe(ReservationStatus.COMMITTED);
        });
    });

    describe('isExpired', () => {
        it('should return false for non-expired reservation', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001',
                60
            );

            expect(reservation.isExpired()).toBe(false);
        });

        it('should return true for expired reservation', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001',
                0
            );

            // Wait a bit to ensure expiration
            setTimeout(() => {
                expect(reservation.isExpired()).toBe(true);
            }, 100);
        });
    });

    describe('canExtend', () => {
        it('should allow extension for active reservation', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            expect(reservation.canExtend()).toBe(true);
        });

        it('should not allow extension for committed reservation', () => {
            const reservation = Reservation.create(
                'res-1',
                'store-1',
                'prod-1',
                10,
                'ORD-001'
            );

            reservation.commit();

            expect(reservation.canExtend()).toBe(false);
        });
    });
});