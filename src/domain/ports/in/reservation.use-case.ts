import { InventoryItem } from '../../models/inventory-item.model';

export interface ReservationUseCase {
  reserveStock(
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string,
    customerId?: string
  ): Promise<InventoryItem>;

  releaseStock(
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string
  ): Promise<InventoryItem>;

  confirmSale(
    storeId: string,
    productId: string,
    qty: number,
    orderRef: string
  ): Promise<InventoryItem>;
}
