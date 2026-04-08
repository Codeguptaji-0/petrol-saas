import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  addDensity(
    user: { tenantId: string; pumpId?: string; id: string },
    body: { fuelType: string; densityValue: number; measuredAt: string }
  ) {
    return this.prisma.fuelDensityLog.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        managerUserId: user.id,
        fuelType: body.fuelType,
        densityValue: body.densityValue,
        measuredAt: new Date(body.measuredAt)
      }
    });
  }

  addStock(
    user: { tenantId: string; pumpId?: string; id: string },
    body: {
      fuelType: string;
      openingStock: number;
      receivedStock: number;
      soldStock: number;
      closingStock: number;
      entryDate: string;
    }
  ) {
    return this.prisma.fuelStockEntry.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        managerUserId: user.id,
        fuelType: body.fuelType,
        openingStock: body.openingStock,
        receivedStock: body.receivedStock,
        soldStock: body.soldStock,
        closingStock: body.closingStock,
        entryDate: new Date(body.entryDate)
      }
    });
  }
}
