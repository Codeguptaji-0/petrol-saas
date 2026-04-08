import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AttendanceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; tenantId: string };
    if (!user?.id || !user?.tenantId) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        tenantId: user.tenantId,
        userId: user.id,
        date: today,
        checkInAt: { not: null }
      }
    });
    if (!attendance) {
      throw new ForbiddenException("Attendance is required before this action.");
    }
    return true;
  }
}
