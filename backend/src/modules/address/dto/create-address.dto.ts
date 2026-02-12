import { IsString, IsNotEmpty, IsOptional, IsBoolean, Matches } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  detail: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
