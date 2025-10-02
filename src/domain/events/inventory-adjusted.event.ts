import { DomainEvent } from './domain-event';

export class InventoryAdjustedEvent extends DomainEvent {
  constructor(
    public readonly inventoryItemId: string,
    public readonly productId: string,
    public readonly storeId: string,
    public readonly adjustmentQty: number,
    public readonly newBalance: number,
    public readonly actor: string
  ) {
    super();
  }
}
