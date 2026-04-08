import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async admin(tenantId: string, pumpId?: string) {
    const attendanceCount = await this.prisma.attendance.count({
      where: { tenantId, ...(pumpId ? { pumpId } : {}) }
    });
    const pendingTasks = await this.prisma.task.count({
      where: { tenantId, status: "PENDING" as never, ...(pumpId ? { pumpId } : {}) }
    });
    const approvedCash = await this.prisma.cashReport.count({
      where: { tenantId, status: "ADMIN_APPROVED" as never, ...(pumpId ? { pumpId } : {}) }
    });
    return { attendanceCount, pendingTasks, approvedCash };
  }

  manager(tenantId: string, pumpId?: string) {
    return this.admin(tenantId, pumpId);
  }
}
