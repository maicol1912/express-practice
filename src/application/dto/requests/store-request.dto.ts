import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class StoreRequestDTO {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
