import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as { tenantId?: string };
    if (!user?.tenantId) {
      return false;
    }

    const bodyTenantId = req.body?.tenantId as string | undefined;
    const queryTenantId = req.query?.tenantId as string | undefined;
    const paramTenantId = req.params?.tenantId as string | undefined;
    const incomingTenantId = bodyTenantId ?? queryTenantId ?? paramTenantId;

    if (incomingTenantId && incomingTenantId !== user.tenantId) {
      throw new ForbiddenException("Cross-tenant operation denied.");
    }
    return true;
  }
}
