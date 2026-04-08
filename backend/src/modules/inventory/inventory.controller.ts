import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { AttendanceGuard } from "../../common/guards/attendance.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateDensityDto } from "./dto/create-density.dto";
import { CreateStockDto } from "./dto/create-stock.dto";
import { InventoryService } from "./inventory.service";

@Controller("inventory")
@UseGuards(JwtAuthGuard, AttendanceGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post("density")
  @Roles(RoleCode.MANAGER)
  density(
    @Req() req: { user: { tenantId: string; pumpId?: string; id: string } },
    @Body() body: CreateDensityDto
  ) {
    return this.inventoryService.addDensity(req.user, body);
  }

  @Post("stock")
  @Roles(RoleCode.MANAGER)
  stock(
    @Req() req: { user: { tenantId: string; pumpId?: string; id: string } },
    @Body() body: CreateStockDto
  ) {
    return this.inventoryService.addStock(req.user, body);
  }
}
