import { DomainEvent } from './domain-event';

export class InventoryUpdatedEvent extends DomainEvent {
  constructor(
    public readonly inventoryItemId: string,
    public readonly productId: string,
    public readonly storeId: string
  ) {
    super();
  }
}
