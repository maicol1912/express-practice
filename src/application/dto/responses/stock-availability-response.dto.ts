export class StockAvailabilityResponseDTO {
  productId!: string;
  productName?: string;
  storeId!: string;
  storeName?: string;
  availableQuantity!: number;
  reservedQuantity!: number;
  committedQuantity!: number;
  inTransitQuantity!: number;
  totalQuantity!: number;
  isAvailable!: boolean;
  timestamp!: Date;
}
