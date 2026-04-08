import { Injectable } from "@nestjs/common";
import { ApprovalStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SwapsService {
  constructor(private readonly prisma: PrismaService) {}

  request(
    user: { tenantId: string; pumpId?: string; id: string },
    body: { targetUserId: string; rosterId: string; reason?: string }
  ) {
    return this.prisma.swapRequest.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        requesterUserId: user.id,
        targetUserId: body.targetUserId,
        rosterId: body.rosterId,
        reason: body.reason
      }
    });
  }

  approve(user: { id: string }, id: string) {
    return this.prisma.swapRequest.update({
      where: { id },
      data: { status: ApprovalStatus.APPROVED, approvedBy: user.id, approvedAt: new Date() }
    });
  }

  reject(user: { id: string }, id: string, reason: string) {
    return this.prisma.swapRequest.update({
      where: { id },
      data: {
        status: ApprovalStatus.REJECTED,
        approvedBy: user.id,
        approvedAt: new Date(),
        rejectedReason: reason
      }
    });
  }
}
