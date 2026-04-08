import { IsEnum, IsOptional, IsString } from "class-validator";
import { ScheduleType } from "@prisma/client";

export class CreateScheduleDto {
  @IsString()
  templateId!: string;

  @IsEnum(ScheduleType)
  scheduleType!: ScheduleType;

  @IsOptional()
  @IsString()
  cronExpr?: string;
}
