import { Reservation, ReservationStatus } from '../../models/reservation.model';

export interface ReservationRepositoryPort {
  save(reservation: Reservation): Promise<Reservation>;

  findById(id: string): Promise<Reservation | null>;

  findActiveByOrderRef(orderRef: string): Promise<Reservation | null>;

  findByStoreAndProduct(
    storeId: string,
    productId: string,
    status?: ReservationStatus
  ): Promise<Reservation[]>;

  delete(id: string): Promise<void>;
}
