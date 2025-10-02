import { IsString, IsNotEmpty, IsEmail, MinLength, IsOptional, IsUUID } from 'class-validator';

export class CreateUserRequestDTO {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  roleName!: string;

  @IsUUID()
  @IsOptional()
  storeId?: string;
}
