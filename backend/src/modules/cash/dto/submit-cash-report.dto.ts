import { IsDateString, IsNumber, IsOptional } from "class-validator";

export class SubmitCashReportDto {
  @IsDateString()
  businessDate!: string;

  @IsNumber()
  onlineAmount!: number;

  @IsNumber()
  offlineAmount!: number;

  @IsOptional()
  denominationJson?: unknown;
}
