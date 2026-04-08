import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { AttendanceGuard } from "../../common/guards/attendance.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { RejectSwapDto } from "./dto/reject-swap.dto";
import { SwapRequestDto } from "./dto/swap-request.dto";
import { SwapsService } from "./swaps.service";

@Controller("swaps")
@UseGuards(JwtAuthGuard, AttendanceGuard, RolesGuard)
export class SwapsController {
  constructor(private readonly swapsService: SwapsService) {}

  @Post("request")
  @Roles(RoleCode.DSM)
  request(
    @Req() req: { user: { tenantId: string; pumpId?: string; id: string } },
    @Body() body: SwapRequestDto
  ) {
    return this.swapsService.request(req.user, body);
  }

  @Post(":id/approve")
  @Roles(RoleCode.MANAGER, RoleCode.ADMIN)
  approve(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return this.swapsService.approve(req.user, id);
  }

  @Post(":id/reject")
  @Roles(RoleCode.MANAGER, RoleCode.ADMIN)
  reject(
    @Req() req: { user: { id: string } },
    @Param("id") id: string,
    @Body() body: RejectSwapDto
  ) {
    return this.swapsService.reject(req.user, id, body.reason);
  }
}
