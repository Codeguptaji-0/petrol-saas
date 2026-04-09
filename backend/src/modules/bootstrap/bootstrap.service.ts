import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma, RoleCode } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { BootstrapInitDto } from "./dto/bootstrap-init.dto";

function defaultPumpCode(tenantName: string) {
  const base = tenantName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 10);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "pump"}-${suffix}`;
}

@Injectable()
export class BootstrapService {
  constructor(private readonly prisma: PrismaService) {}

  async init(dto: BootstrapInitDto) {
    const already = await this.prisma.user.findFirst({
      where: { role: RoleCode.ADMIN }
    });
    if (already) {
      throw new ConflictException("Bootstrap already completed (admin user exists).");
    }

    const tenant = await this.prisma.tenant.create({
      data: { name: dto.tenantName }
    });

    const shouldCreatePump =
      dto.pumpName !== undefined ||
      dto.pumpCode !== undefined ||
      dto.pumpLat !== undefined ||
      dto.pumpLng !== undefined;

    const pump = shouldCreatePump
      ? await this.prisma.pump.create({
          data: {
            tenantId: tenant.id,
            name: dto.pumpName ?? `${dto.tenantName} Main Pump`,
            code: dto.pumpCode ?? defaultPumpCode(dto.tenantName),
            lat: dto.pumpLat ?? 0,
            lng: dto.pumpLng ?? 0,
            geofenceRadiusM: dto.pumpGeofenceRadiusM ?? 150
          }
        })
      : null;

    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    const admin = await this.prisma.user.create({
      data: {
        tenantId: tenant.id,
        pumpId: pump?.id ?? null,
        fullName: dto.adminFullName,
        phone: dto.adminPhone,
        email: dto.adminEmail,
        passwordHash,
        role: RoleCode.ADMIN,
        isActive: true
      }
    });

    return {
      tenantId: tenant.id,
      pumpId: pump?.id ?? null,
      adminUserId: admin.id
    };
  }
}

