import { IsString, IsNumber, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  categoryId: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
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
