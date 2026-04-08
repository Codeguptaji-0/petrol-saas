import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Observable, tap } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method as string;
    if (method === "GET") {
      return next.handle();
    }
    const user = req.user as { id?: string; tenantId?: string } | undefined;
    const path = req.path as string;
    const body = req.body as Record<string, unknown> | undefined;

    return next.handle().pipe(
      tap(async (response) => {
        if (!user?.tenantId) return;
        await this.prisma.auditLog.create({
          data: {
            tenantId: user.tenantId,
            actorUserId: user.id,
            action: `${method} ${path}`,
            entity: path.split("/")[2] ?? "unknown",
            entityId: String((body?.id as string | undefined) ?? "na"),
            afterJson: response as object,
            ip: req.ip,
            userAgent: req.headers["user-agent"] as string | undefined
          }
        });
      })
    );
  }
}
