import { IsNumber, IsOptional, IsString } from "class-validator";

export class CheckInDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsString()
  @IsOptional()
  imageKey?: string;
}
