import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RosterService {
  constructor(private readonly prisma: PrismaService) {}

  createNextDay(
    user: { tenantId: string; pumpId?: string; id: string },
    body: { date: string; shiftCode: string; assignedUserId: string; fuelPoint?: string }
  ) {
    return this.prisma.roster.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        date: new Date(body.date),
        shiftCode: body.shiftCode,
        assignedUserId: body.assignedUserId,
        assignedByUserId: user.id,
        fuelPoint: body.fuelPoint
      }
    });
  }

  myRoster(user: { tenantId: string; id: string }, date?: string) {
    return this.prisma.roster.findMany({
      where: {
        tenantId: user.tenantId,
        assignedUserId: user.id,
        ...(date ? { date: new Date(date) } : {})
      },
      orderBy: { date: "asc" }
    });
  }
}
