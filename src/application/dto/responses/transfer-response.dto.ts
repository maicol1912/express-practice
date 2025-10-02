export class TransferResponseDTO {
  id!: string;
  productId!: string;
  productName?: string;
  originStoreId!: string;
  originStoreName?: string;
  destinationStoreId!: string;
  destinationStoreName?: string;
  quantity!: number;
  status!: string;
  createdAt!: Date;
  completedAt?: Date;
  updatedAt!: Date;
}
