import { DomainEvent } from './domain-event';

export class SaleConfirmedEvent extends DomainEvent {
  constructor(
    public readonly reservationId: string,
    public readonly productId: string,
    public readonly storeId: string,
    public readonly quantity: number,
    public readonly orderRef: string
  ) {
    super();
  }
}
