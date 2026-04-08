import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { AttendanceGuard } from "../../common/guards/attendance.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { SubmitCashReportDto } from "./dto/submit-cash-report.dto";
import { CashService } from "./cash.service";

@Controller("cash-reports")
@UseGuards(JwtAuthGuard, AttendanceGuard, RolesGuard)
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Post()
  @Roles(RoleCode.DSM)
  submit(
    @Req() req: { user: { tenantId: string; pumpId?: string; id: string } },
    @Body() body: SubmitCashReportDto
  ) {
    return this.cashService.submit(req.user, body);
  }

  @Post(":id/accountant-verify")
  @Roles(RoleCode.ACCOUNTANT)
  accountantVerify(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return this.cashService.accountantVerify(req.user, id);
  }

  @Post(":id/admin-approve")
  @Roles(RoleCode.ADMIN)
  adminApprove(@Req() req: { user: { id: string } }, @Param("id") id: string) {
    return this.cashService.adminApprove(req.user, id);
  }
}
