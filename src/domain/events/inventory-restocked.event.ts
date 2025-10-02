import { DomainEvent } from './domain-event';

export class InventoryRestockedEvent extends DomainEvent {
  constructor(
    public readonly inventoryItemId: string,
    public readonly productId: string,
    public readonly storeId: string,
    public readonly quantity: number,
    public readonly newBalance: number,
    public readonly actor: string
  ) {
    super();
  }
}
