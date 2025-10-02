export class ReservationResponseDTO {
  id!: string;
  orderRef!: string;
  productId!: string;
  productName?: string;
  storeId!: string;
  storeName?: string;
  quantity!: number;
  status!: string;
  expiresAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}
