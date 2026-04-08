import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { AttendanceGuard } from "../../common/guards/attendance.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateRosterDto } from "./dto/create-roster.dto";
import { RosterService } from "./roster.service";

@Controller("rosters")
@UseGuards(JwtAuthGuard, AttendanceGuard, RolesGuard)
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Post("next-day")
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  createNextDay(
    @Req() req: { user: { tenantId: string; pumpId?: string; id: string } },
    @Body() body: CreateRosterDto
  ) {
    return this.rosterService.createNextDay(req.user, body);
  }

  @Get("my")
  @Roles(RoleCode.MANAGER, RoleCode.ACCOUNTANT, RoleCode.DSM, RoleCode.CLEANING)
  my(@Req() req: { user: { tenantId: string; id: string } }, @Query("date") date?: string) {
    return this.rosterService.myRoster(req.user, date);
  }
}
