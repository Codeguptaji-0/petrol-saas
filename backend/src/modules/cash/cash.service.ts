import { Injectable } from "@nestjs/common";
import { CashReportStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CashService {
  constructor(private readonly prisma: PrismaService) {}

  submit(
    user: { tenantId: string; pumpId?: string; id: string },
    body: { businessDate: string; onlineAmount: number; offlineAmount: number; denominationJson?: unknown }
  ) {
    const total = body.onlineAmount + body.offlineAmount;
    return this.prisma.cashReport.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        dsmUserId: user.id,
        businessDate: new Date(body.businessDate),
        onlineAmount: body.onlineAmount,
        offlineAmount: body.offlineAmount,
        totalAmount: total,
        denominationJson: body.denominationJson ?? null,
        status: CashReportStatus.SUBMITTED,
        submittedAt: new Date()
      }
    });
  }

  accountantVerify(user: { id: string }, id: string) {
    return this.prisma.cashReport.update({
      where: { id },
      data: {
        status: CashReportStatus.ACCOUNTANT_VERIFIED,
        accountantId: user.id,
        accountantVerifiedAt: new Date()
      }
    });
  }

  adminApprove(user: { id: string }, id: string) {
    return this.prisma.cashReport.update({
      where: { id },
      data: {
        status: CashReportStatus.ADMIN_APPROVED,
        adminId: user.id,
        adminApprovedAt: new Date()
      }
    });
  }
}
