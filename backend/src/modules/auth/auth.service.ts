import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; role: string; tenantId: string; pumpId: string | null };
  }> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.username }, { email: dto.username }]
      }
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      pumpId: user.pumpId
    });
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id, tenantId: user.tenantId, role: user.role, type: "refresh" },
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d" }
    );
    const decoded = this.jwtService.decode(refreshToken) as { exp?: number } | null;
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        deviceId: dto.deviceId,
        expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7 * 86400000)
      }
    });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        role: user.role,
        tenantId: user.tenantId,
        pumpId: user.pumpId
      }
    };
  }

  async refresh(refreshToken: string): Promise<string> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET ?? "dev-secret"
    }) as { sub: string; tenantId: string; role: string; type?: string };
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }
    const sessions = await this.prisma.userSession.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
    const matched = await Promise.all(
      sessions.map(async (session) => ({
        sessionId: session.id,
        ok: await bcrypt.compare(refreshToken, session.refreshTokenHash)
      }))
    );
    if (!matched.some((item) => item.ok)) {
      throw new UnauthorizedException("Refresh session not found");
    }
    return this.jwtService.sign({
      sub: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role
    });
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_SECRET ?? "dev-secret"
    }) as { sub: string; type?: string };
    if (payload.type !== "refresh") {
      return;
    }
    const sessions = await this.prisma.userSession.findMany({
      where: { userId: payload.sub, revokedAt: null }
    });
    const matched = await Promise.all(
      sessions.map(async (session) => ({
        sessionId: session.id,
        ok: await bcrypt.compare(refreshToken, session.refreshTokenHash)
      }))
    );
    const target = matched.find((item) => item.ok);
    if (!target) return;
    await this.prisma.userSession.update({
      where: { id: target.sessionId },
      data: { revokedAt: new Date() }
    });
  }
}
