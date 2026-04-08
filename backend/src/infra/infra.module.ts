import { Global, Module } from "@nestjs/common";
import { RekognitionService } from "./face/rekognition.service";
import { GeofenceService } from "./maps/geofence.service";
import { SchedulerService } from "./queue/scheduler.service";
import { S3Service } from "./storage/s3.service";

@Global()
@Module({
  providers: [S3Service, RekognitionService, GeofenceService, SchedulerService],
  exports: [S3Service, RekognitionService, GeofenceService, SchedulerService]
})
export class InfraModule {}
