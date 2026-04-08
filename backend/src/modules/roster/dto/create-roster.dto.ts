import { IsOptional, IsString } from "class-validator";

export class CreateRosterDto {
  @IsString()
  date!: string;

  @IsString()
  shiftCode!: string;

  @IsString()
  assignedUserId!: string;

  @IsOptional()
  @IsString()
  fuelPoint?: string;
}
