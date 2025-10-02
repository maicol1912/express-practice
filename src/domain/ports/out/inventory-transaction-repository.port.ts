import { InventoryTransaction } from '../../models/inventory-transaction.model';

export interface InventoryTransactionRepositoryPort {
  save(transaction: InventoryTransaction): Promise<InventoryTransaction>;

  findByInventoryItem(inventoryItemId: string): Promise<InventoryTransaction[]>;

  findByStore(storeId: string, limit?: number): Promise<InventoryTransaction[]>;
}
