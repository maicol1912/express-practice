import { IsUUID, IsInt, IsNotEmpty, Min } from 'class-validator';

export class RestockRequestDTO {
  @IsUUID()
  @IsNotEmpty()
  storeId!: string;

  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
