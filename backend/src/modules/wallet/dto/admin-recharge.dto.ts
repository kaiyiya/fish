import { IsInt, IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class AdminRechargeDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  @Max(99999999)
  amount: number;
}

