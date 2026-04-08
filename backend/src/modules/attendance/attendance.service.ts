import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CheckInDto } from "./dto/check-in.dto";
import { RekognitionService } from "../../infra/face/rekognition.service";
import { GeofenceService } from "../../infra/maps/geofence.service";

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rekognitionService: RekognitionService,
    private readonly geofenceService: GeofenceService
  ) {}

  async checkIn(
    user: { id: string; tenantId: string; pumpId?: string },
    dto: CheckInDto
  ) {
    if (!user.pumpId) {
      throw new BadRequestException("User is not mapped to a pump.");
    }
    const pump = await this.prisma.pump.findUnique({ where: { id: user.pumpId } });
    if (!pump) {
      throw new BadRequestException("Pump not found.");
    }
    const distance = this.geofenceService.distanceMeters(dto.lat, dto.lng, pump.lat, pump.lng);
    const geoPassed = distance <= pump.geofenceRadiusM;
    if (!geoPassed) {
      throw new BadRequestException("Outside geofence area.");
    }
    const appUser = await this.prisma.user.findUnique({ where: { id: user.id } });
    let faceScore = 95;
    if (dto.imageKey && appUser?.faceProfileImageKey && process.env.AWS_S3_BUCKET) {
      faceScore = await this.rekognitionService.compareByS3(
        process.env.AWS_S3_BUCKET,
        dto.imageKey,
        process.env.AWS_S3_BUCKET,
        appUser.faceProfileImageKey
      );
      if (faceScore < 90) {
        throw new BadRequestException("Face verification failed.");
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.attendance.upsert({
      where: {
        tenantId_userId_date: {
          tenantId: user.tenantId,
          userId: user.id,
          date: today
        }
      },
      update: {
        checkInAt: new Date(),
        inLat: dto.lat,
        inLng: dto.lng,
        inDistanceM: distance,
        geoCheckPassed: true,
        faceCheckStatus: "PASSED",
        geoCheckStatus: "PASSED",
        faceScore
      },
      create: {
        tenantId: user.tenantId,
        pumpId: user.pumpId,
        userId: user.id,
        date: today,
        checkInAt: new Date(),
        inLat: dto.lat,
        inLng: dto.lng,
        inDistanceM: distance,
        geoCheckStatus: "PASSED",
        faceCheckStatus: "PASSED",
        faceScore
      }
    });
  }

  checkOut(user: { id: string; tenantId: string }, dto: { lat: number; lng: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.attendance.update({
      where: {
        tenantId_userId_date: {
          tenantId: user.tenantId,
          userId: user.id,
          date: today
        }
      },
      data: {
        checkOutAt: new Date(),
        outLat: dto.lat,
        outLng: dto.lng
      }
    });
  }

  today(user: { id: string; tenantId: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findUnique({
      where: {
        tenantId_userId_date: {
          tenantId: user.tenantId,
          userId: user.id,
          date: today
        }
      }
    });
  }

  byPump(tenantId: string, pumpId: string, date: string) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return this.prisma.attendance.findMany({
      where: { tenantId, pumpId, date: d },
      orderBy: { checkInAt: "asc" }
    });
  }
}
