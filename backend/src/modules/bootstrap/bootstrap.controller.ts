import { Body, ConflictException, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BootstrapInitDto } from "./dto/bootstrap-init.dto";
import { BootstrapService } from "./bootstrap.service";

@ApiTags("bootstrap")
@Controller("bootstrap")
export class BootstrapController {
  constructor(private readonly bootstrapService: BootstrapService) {}

  @Post("init")
  async init(@Body() dto: BootstrapInitDto) {
    const expected = process.env.BOOTSTRAP_TOKEN;
    if (!expected) {
      throw new ConflictException("BOOTSTRAP_TOKEN is not configured on server.");
    }
    if (dto.token !== expected) {
      throw new UnauthorizedException("Invalid bootstrap token.");
    }
    return this.bootstrapService.init(dto);
  }
}

