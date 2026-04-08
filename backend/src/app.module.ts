import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { CashModule } from "./modules/cash/cash.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { RosterModule } from "./modules/roster/roster.module";
import { SwapsModule } from "./modules/swaps/swaps.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { UsersModule } from "./modules/users/users.module";
import { PumpsModule } from "./modules/pumps/pumps.module";
import { InfraModule } from "./infra/infra.module";
import { StorageModule } from "./modules/storage/storage.module";
import { AuditInterceptor } from "./common/interceptors/audit.interceptor";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerGuard } from "@nestjs/throttler";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    PrismaModule,
    InfraModule,
    AuthModule,
    TenantsModule,
    PumpsModule,
    UsersModule,
    AttendanceModule,
    TasksModule,
    StorageModule,
    RosterModule,
    SwapsModule,
    CashModule,
    InventoryModule,
    NotificationsModule,
    DashboardModule,
    RealtimeModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor
    }
  ]
})
export class AppModule {}
