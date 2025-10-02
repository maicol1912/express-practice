import { DomainEvent } from './domain-event';

export class TransferCreatedEvent extends DomainEvent {
  constructor(
    public readonly transferId: string,
    public readonly fromStoreId: string,
    public readonly toStoreId: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly requestedBy: string
  ) {
    super();
  }
}
