import { IsNotEmpty, IsString } from "class-validator";

export class RejectSwapDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
