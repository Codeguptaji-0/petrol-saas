import { Module } from "@nestjs/common";
import { PumpsController } from "./pumps.controller";
import { PumpsService } from "./pumps.service";

@Module({
  controllers: [PumpsController],
  providers: [PumpsService]
})
export class PumpsModule {}
