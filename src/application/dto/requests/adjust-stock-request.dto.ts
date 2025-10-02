import { IsUUID, IsInt, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AdjustStockRequestDTO {
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @IsNotEmpty()
  quantity!: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
