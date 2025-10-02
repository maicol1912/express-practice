export class ProductResponseDTO {
  id!: string;
  sku!: string;
  name!: string;
  description?: string;
  price!: number;
  categoryId!: string;
  categoryName?: string;
  active!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
