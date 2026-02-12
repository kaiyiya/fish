import { IsNumber, IsNotEmpty, IsOptional, IsString, IsArray, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number; // 1-5

  @IsString()
  @IsOptional()
  content?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  orderId?: number; // 可选，关联订单
}
