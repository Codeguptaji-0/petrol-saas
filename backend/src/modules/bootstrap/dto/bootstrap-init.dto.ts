import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class BootstrapInitDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  tenantName!: string;

  @IsString()
  @IsNotEmpty()
  adminFullName!: string;

  @IsString()
  @IsNotEmpty()
  adminPhone!: string;

  @IsEmail()
  @IsOptional()
  adminEmail?: string;

  @IsString()
  @IsNotEmpty()
  adminPassword!: string;

  @IsString()
  @IsOptional()
  pumpName?: string;

  @IsString()
  @IsOptional()
  pumpCode?: string;

  @IsNumber()
  @IsOptional()
  pumpLat?: number;

  @IsNumber()
  @IsOptional()
  pumpLng?: number;

  @IsNumber()
  @IsOptional()
  @Min(10)
  pumpGeofenceRadiusM?: number;
}

