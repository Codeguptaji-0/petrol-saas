import { IsDateString, IsNumber, IsString } from "class-validator";

export class CreateDensityDto {
  @IsString()
  fuelType!: string;

  @IsNumber()
  densityValue!: number;

  @IsDateString()
  measuredAt!: string;
}
