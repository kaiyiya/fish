import { IsString, IsNumber, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsDateString, Min } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['discount', 'reduce', 'free'])
  @IsNotEmpty()
  type: 'discount' | 'reduce' | 'free';

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  totalCount?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  limitPerUser?: number;

  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @IsDateString()
  @IsOptional()
  endTime?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
