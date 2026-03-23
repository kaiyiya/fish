import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateRechargeDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  @Max(99999999)
  amount: number;
}

