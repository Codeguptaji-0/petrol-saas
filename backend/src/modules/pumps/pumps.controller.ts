import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PumpsService } from "./pumps.service";

@Controller("pumps")
@UseGuards(JwtAuthGuard)
export class PumpsController {
  constructor(private readonly pumpsService: PumpsService) {}

  @Get()
  list(@Req() req: { user: { tenantId: string } }) {
    return this.pumpsService.listByTenant(req.user.tenantId);
  }
}
