import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateTaskDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueAt!: string;

  @IsOptional()
  @IsString()
  assignedToUserId?: string;
}
