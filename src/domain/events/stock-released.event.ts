import { DomainEvent } from './domain-event';

export class StockReleasedEvent extends DomainEvent {
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
