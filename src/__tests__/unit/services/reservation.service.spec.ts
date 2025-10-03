import 'reflect-metadata';
import { ReservationService } from '@application/services/reservation.service';
import { NotFoundException, AlreadyExistsException, InvalidReservationException } from '@domain/exceptions/domain.exception';
import { MockRepositories } from '@tests/utils/mocks';
import { TestFactories } from '@tests/utils/factories';
import { mock } from 'jest-mock-extended';
import { ReservationStatus } from '@domain/models/reservation.model';

describe('ReservationService - Unit Tests', () => {
    let reservationService: ReservationService;
    let inventoryRepository: any;
    let reservationRepository: any;
    let transactionRepository: any;
    let eventPublisher: any;

    beforeEach(() => {
        inventoryRepository = MockRepositories.inventoryRepository();
        reservationRepository = mock<any>();
        transactionRepository = mock<any>();
        eventPublisher = MockRepositories.eventPublisher();

        reservationService = new ReservationService(
            inventoryRepository,
            reservationRepository,
            transactionRepository,
            eventPublisher
        );
    });

    describe('reserveStock', () => {
        it('should reserve stock successfully', async () => {
            const inventory = TestFactories.createInventoryItem({
                onHand: 100,
                available: 80,
                reserved: 20
            });

            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            reservationRepository.findActiveByOrderRef.mockResolvedValue(null);
            reservationRepository.save.mockImplementation((r: any) => Promise.resolve(r));
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});

            const result = await reservationService.reserveStock(
                inventory.storeId,
                inventory.productId,
                10,
                'ORD-001'
            );

            expect(result.reserved).toBe(30);
            expect(result.available).toBe(70);
            expect(reservationRepository.save).toHaveBeenCalled();
            expect(eventPublisher.publish).toHaveBeenCalledTimes(2);
        });

        it('should throw AlreadyExistsException for duplicate orderRef', async () => {
            const existingReservation = TestFactories.createReservation({
                orderRef: 'ORD-001'
            });

            reservationRepository.findActiveByOrderRef.mockResolvedValue(existingReservation);

            await expect(
                reservationService.reserveStock('store-1', 'prod-1', 10, 'ORD-001')
            ).rejects.toThrow(AlreadyExistsException);
        });

        it('should throw NotFoundException when inventory not found', async () => {
            inventoryRepository.findByProductAndStore.mockResolvedValue(null);
            reservationRepository.findActiveByOrderRef.mockResolvedValue(null);

            await expect(
                reservationService.reserveStock('store-1', 'prod-1', 10, 'ORD-001')
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw InvalidReservationException when insufficient stock', async () => {
            const inventory = TestFactories.createInventoryItem({
                onHand: 100,
                available: 5,
                reserved: 95
            });

            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            reservationRepository.findActiveByOrderRef.mockResolvedValue(null);

            await expect(
                reservationService.reserveStock(inventory.storeId, inventory.productId, 10, 'ORD-001')
            ).rejects.toThrow(InvalidReservationException);
        });
    });

    describe('releaseStock', () => {
        it('should release reserved stock successfully', async () => {
            const reservation = TestFactories.createReservation({
                status: ReservationStatus.ACTIVE,
                qty: 10,
                orderRef: 'ORD-001'
            });

            const inventory = TestFactories.createInventoryItem({
                productId: reservation.productId,
                storeId: reservation.storeId,
                onHand: 100,
                available: 70,
                reserved: 30
            });

            reservationRepository.findActiveByOrderRef.mockResolvedValue(reservation);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            reservationRepository.save.mockImplementation((r: any) => Promise.resolve(r));
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});

            const result = await reservationService.releaseStock(
                reservation.storeId,
                reservation.productId,
                10,
                'ORD-001'
            );

            expect(result.reserved).toBe(20);
            expect(result.available).toBe(80);
            expect(eventPublisher.publish).toHaveBeenCalled();
        });

        it('should throw NotFoundException when reservation not found', async () => {
            reservationRepository.findActiveByOrderRef.mockResolvedValue(null);

            await expect(
                reservationService.releaseStock('store-1', 'prod-1', 10, 'ORD-001')
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw InvalidReservationException for non-active reservation', async () => {
            const reservation = TestFactories.createReservation({
                status: ReservationStatus.COMMITTED,
                orderRef: 'ORD-001'
            });

            reservationRepository.findActiveByOrderRef.mockResolvedValue(reservation);

            await expect(
                reservationService.releaseStock('store-1', 'prod-1', 10, 'ORD-001')
            ).rejects.toThrow(InvalidReservationException);
        });
    });

    describe('confirmSale', () => {
        it('should confirm sale successfully', async () => {
            const reservation = TestFactories.createReservation({
                status: ReservationStatus.ACTIVE,
                qty: 5,
                orderRef: 'ORD-001'
            });

            const inventory = TestFactories.createInventoryItem({
                productId: reservation.productId,
                storeId: reservation.storeId,
                onHand: 100,
                available: 80,
                reserved: 20
            });

            reservationRepository.findActiveByOrderRef.mockResolvedValue(reservation);
            inventoryRepository.findByProductAndStore.mockResolvedValue(inventory);
            reservationRepository.save.mockImplementation((r: any) => Promise.resolve(r));
            inventoryRepository.save.mockImplementation((i: any) => Promise.resolve(i));
            transactionRepository.save.mockResolvedValue({});

            const result = await reservationService.confirmSale(
                reservation.storeId,
                reservation.productId,
                5,
                'ORD-001'
            );

            expect(result.committed).toBe(5);
            expect(result.reserved).toBe(15);
            expect(result.onHand).toBe(95);
            expect(eventPublisher.publish).toHaveBeenCalled();
        });

        it('should throw InvalidReservationException for quantity mismatch', async () => {
            const reservation = TestFactories.createReservation({
                qty: 5,
                orderRef: 'ORD-001'
            });

            reservationRepository.findActiveByOrderRef.mockResolvedValue(reservation);

            await expect(
                reservationService.confirmSale('store-1', 'prod-1', 10, 'ORD-001')
            ).rejects.toThrow(InvalidReservationException);
        });
    });
});