import { IsOptional, IsString } from "class-validator";

export class SwapRequestDto {
  @IsString()
  targetUserId!: string;

  @IsString()
  rosterId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
