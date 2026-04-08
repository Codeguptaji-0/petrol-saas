import { IsEnum, IsString } from "class-validator";
import { RoleCode } from "@prisma/client";

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsEnum(RoleCode)
  roleTarget!: RoleCode;
}
