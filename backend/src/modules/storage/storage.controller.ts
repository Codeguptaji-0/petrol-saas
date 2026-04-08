import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IsNotEmpty, IsString } from "class-validator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { S3Service } from "../../infra/storage/s3.service";

class UploadUrlDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsNotEmpty()
  contentType!: string;
}

@Controller("storage")
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly s3Service: S3Service) {}

  @Post("presigned-upload")
  async createUploadUrl(@Body() dto: UploadUrlDto) {
    const url = await this.s3Service.createUploadUrl(dto.key, dto.contentType);
    return { url, key: dto.key };
  }
}
