import { DomainEvent } from './domain-event';

export class TransferCompletedEvent extends DomainEvent {
  constructor(
    public readonly transferId: string,
    public readonly fromStoreId: string,
    public readonly toStoreId: string,
    public readonly productId: string,
    public readonly quantity: number
  ) {
    super();
  }
}
