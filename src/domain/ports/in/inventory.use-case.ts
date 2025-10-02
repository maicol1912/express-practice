import { InventoryItem } from '../../models/inventory-item.model';
import { StockAvailability } from '../../value-objects/stock-availability.vo';

export interface InventoryUseCase {
  adjustStock(
    storeId: string,
    productId: string,
    qty: number,
    actor: string,
    referenceId: string | null,
    notes?: string
  ): Promise<InventoryItem>;

  restock(
    storeId: string,
    productId: string,
    qty: number,
    actor: string,
    referenceId: string | null,
    notes?: string
  ): Promise<InventoryItem>;

  getStockAvailability(
    productId: string,
    storeId: string,
    useCache?: boolean
  ): Promise<StockAvailability>;

  listInventoryByStore(storeId: string): Promise<InventoryItem[]>;

  listLowStockItems(storeId: string, threshold: number): Promise<InventoryItem[]>;
}
