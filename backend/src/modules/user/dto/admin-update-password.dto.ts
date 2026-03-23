import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminUpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

