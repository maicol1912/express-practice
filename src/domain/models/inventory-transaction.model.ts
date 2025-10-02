export enum TransactionType {
  ADJUST_INCREASE = 'ADJUST_INCREASE',
  ADJUST_DECREASE = 'ADJUST_DECREASE',
  RESERVE = 'RESERVE',
  RELEASE = 'RELEASE',
  SALE = 'SALE',
  RESTOCK = 'RESTOCK',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

export class InventoryTransaction {
  constructor(
    public id: string,
    public inventoryItemId: string,
    public productId: string,
    public storeId: string,
    public type: TransactionType,
    public quantity: number,
    public balanceAfter: number,
    public actor: string,
    public referenceId: string | null,
    public notes: string | null,
    public createdAt: Date
  ) {}
}
