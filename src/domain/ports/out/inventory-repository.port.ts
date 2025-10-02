import { InventoryItem } from '../../models/inventory-item.model';
import { StockAvailability } from '../../value-objects/stock-availability.vo';

export interface InventoryRepositoryPort {
  save(item: InventoryItem): Promise<InventoryItem>;

  findByProductAndStore(
    productId: string,
    storeId: string,
    withLock?: boolean
  ): Promise<InventoryItem | null>;

  findById(id: string): Promise<InventoryItem | null>;

  listByStore(storeId: string): Promise<InventoryItem[]>;

  findLowStock(storeId: string, threshold: number): Promise<InventoryItem[]>;

  getStockAvailability(productId: string, storeId: string): Promise<StockAvailability | null>;

  delete(id: string): Promise<void>;
}
