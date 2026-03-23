import { IsNotEmpty, IsNumber, IsPhoneNumber, Min, Max } from 'class-validator';

export class AdminRechargeByPhoneDto {
  @IsPhoneNumber('CN')
  @IsNotEmpty()
  phone: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  @Max(99999999)
  amount: number;
}

