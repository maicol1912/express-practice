export class InventoryResponseDTO {
  id!: string;
  storeId!: string;
  storeName?: string;
  productId!: string;
  productName?: string;
  productSku?: string;
  availableQuantity!: number;
  reservedQuantity!: number;
  committedQuantity!: number;
  inTransitQuantity!: number;
  syncStatus!: string;
  lastSyncAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
