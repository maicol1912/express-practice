import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CategoryRequestDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}
