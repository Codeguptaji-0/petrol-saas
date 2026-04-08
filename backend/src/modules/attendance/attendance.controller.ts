import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AttendanceService } from "./attendance.service";
import { CheckInDto } from "./dto/check-in.dto";

@Controller("attendance")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post("check-in")
  checkIn(
    @Req() req: { user: { id: string; tenantId: string; pumpId?: string } },
    @Body() dto: CheckInDto
  ) {
    return this.attendanceService.checkIn(req.user, dto);
  }

  @Post("check-out")
  checkOut(
    @Req() req: { user: { id: string; tenantId: string } },
    @Body() dto: { lat: number; lng: number }
  ) {
    return this.attendanceService.checkOut(req.user, dto);
  }

  @Get("me/today")
  meToday(@Req() req: { user: { id: string; tenantId: string } }) {
    return this.attendanceService.today(req.user);
  }

  @Get("pump/:pumpId")
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  byPump(
    @Req() req: { user: { tenantId: string } },
    @Param("pumpId") pumpId: string,
    @Query("date") date: string
  ) {
    return this.attendanceService.byPump(req.user.tenantId, pumpId, date);
  }
}
