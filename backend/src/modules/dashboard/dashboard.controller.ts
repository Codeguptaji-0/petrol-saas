import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { AttendanceGuard } from "../../common/guards/attendance.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
@UseGuards(JwtAuthGuard, AttendanceGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("admin")
  @Roles(RoleCode.ADMIN)
  admin(@Req() req: { user: { tenantId: string } }, @Query("pumpId") pumpId?: string) {
    return this.dashboardService.admin(req.user.tenantId, pumpId);
  }

  @Get("manager")
  @Roles(RoleCode.MANAGER)
  manager(@Req() req: { user: { tenantId: string; pumpId?: string } }) {
    return this.dashboardService.manager(req.user.tenantId, req.user.pumpId);
  }
}
