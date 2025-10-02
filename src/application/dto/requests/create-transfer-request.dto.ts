import { IsUUID, IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateTransferRequestDTO {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsUUID()
  @IsNotEmpty()
  originStoreId!: string;

  @IsUUID()
  @IsNotEmpty()
  destinationStoreId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}
