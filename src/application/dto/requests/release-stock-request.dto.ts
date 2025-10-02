import { IsUUID, IsInt, IsString, IsNotEmpty, Min } from 'class-validator';

export class ReleaseStockRequestDTO {
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  orderRef!: string;
}
