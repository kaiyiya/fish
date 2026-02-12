import { IsNumber, IsNotEmpty, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  productId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  price: number;
}

export class CreateOrderDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  totalAmount: number;

  @IsNumber()
  @IsNotEmpty()
  addressId: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
