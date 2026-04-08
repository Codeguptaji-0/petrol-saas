import { IsDateString, IsNumber, IsString } from "class-validator";

export class CreateStockDto {
  @IsString()
  fuelType!: string;

  @IsNumber()
  openingStock!: number;

  @IsNumber()
  receivedStock!: number;

  @IsNumber()
  soldStock!: number;

  @IsNumber()
  closingStock!: number;

  @IsDateString()
  entryDate!: string;
}
