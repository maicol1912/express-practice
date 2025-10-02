import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginRequestDTO {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}
