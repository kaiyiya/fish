import { IsString, IsNumber, IsNotEmpty, IsOptional, IsArray, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  imageUrls?: string[];

  @IsString()
  @IsOptional()
  nutritionInfo?: string;

  @IsString()
  @IsOptional()
  cookingTips?: string;
}
