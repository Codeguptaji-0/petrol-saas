import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  myNotifications(user: { tenantId: string; id: string }) {
    return this.prisma.notification.findMany({
      where: { tenantId: user.tenantId, userId: user.id },
      orderBy: { createdAt: "desc" }
    });
  }
}
