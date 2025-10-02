import { addMinutes } from 'date-fns';

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  COMMITTED = 'COMMITTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  EXTENDED = 'EXTENDED',
  PARTIAL = 'PARTIAL',
}

export enum ReservationType {
  STANDARD = 'STANDARD',
  HIGH_PRIORITY = 'HIGH_PRIORITY',
  LAYAWAY = 'LAYAWAY',
}

export enum ReservationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class Reservation {
  constructor(
    public id: string,
    public storeId: string,
    public productId: string,
    public qty: number,
    public status: ReservationStatus,
    public type: ReservationType,
    public priority: ReservationPriority,
    public orderRef: string,
    public customerId: string | null,
    public createdAt: Date,
    public expiresAt: Date,
    public cancelledReason: string | null
  ) {}

  static create(
    id: string,
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string,
    ttlMinutes: number = 15
  ): Reservation {
    return new Reservation(
      id,
      storeId,
      productId,
      qty,
      ReservationStatus.ACTIVE,
      ReservationType.STANDARD,
      ReservationPriority.NORMAL,
      orderRef,
      null,
      new Date(),
      addMinutes(new Date(), ttlMinutes),
      null
    );
  }

  static createHighPriority(
    id: string,
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string
  ): Reservation {
    return new Reservation(
      id,
      storeId,
      productId,
      qty,
      ReservationStatus.ACTIVE,
      ReservationType.HIGH_PRIORITY,
      ReservationPriority.HIGH,
      orderRef,
      null,
      new Date(),
      addMinutes(new Date(), 30),
      null
    );
  }

  static createLayaway(
    id: string,
    storeId: string,
    productId: string,
    qty: number,
    customerId: string
  ): Reservation {
    return new Reservation(
      id,
      storeId,
      productId,
      qty,
      ReservationStatus.ACTIVE,
      ReservationType.LAYAWAY,
      ReservationPriority.NORMAL,
      `LAYAWAY-${id}`,
      customerId,
      new Date(),
      addMinutes(new Date(), 10080), // 7 days
      null
    );
  }

  cancel(reason: string): void {
    this.status = ReservationStatus.CANCELLED;
    this.cancelledReason = reason;
  }

  commit(): void {
    this.status = ReservationStatus.COMMITTED;
  }

  extend(additionalMinutes: number): void {
    this.expiresAt = addMinutes(this.expiresAt, additionalMinutes);
    this.status = ReservationStatus.EXTENDED;
  }

  usePartially(qtyUsed: number): void {
    if (qtyUsed >= this.qty) {
      this.commit();
    } else {
      this.qty -= qtyUsed;
      this.status = ReservationStatus.PARTIAL;
    }
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  canExtend(): boolean {
    return this.status === ReservationStatus.ACTIVE ||
           this.status === ReservationStatus.EXTENDED;
  }
}
