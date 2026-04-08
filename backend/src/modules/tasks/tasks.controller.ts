import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { RoleCode } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { AttendanceGuard } from "../../common/guards/attendance.guard";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { TasksService } from "./tasks.service";

@Controller("tasks")
@UseGuards(JwtAuthGuard, AttendanceGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  create(
    @Req() req: { user: { tenantId: string; pumpId?: string } },
    @Body() dto: CreateTaskDto
  ) {
    return this.tasksService.create(req.user, dto);
  }

  @Get("my")
  @Roles(
    RoleCode.ADMIN,
    RoleCode.MANAGER,
    RoleCode.ACCOUNTANT,
    RoleCode.DSM,
    RoleCode.CLEANING
  )
  myTasks(@Req() req: { user: { id: string; tenantId: string } }) {
    return this.tasksService.myTasks(req.user);
  }

  @Post("templates")
  @Roles(RoleCode.ADMIN)
  createTemplate(
    @Req() req: { user: { tenantId: string } },
    @Body() body: CreateTemplateDto
  ) {
    return this.tasksService.createTemplate(req.user, body);
  }

  @Post("schedules")
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  createSchedule(
    @Req() req: { user: { tenantId: string; pumpId?: string } },
    @Body() body: CreateScheduleDto
  ) {
    return this.tasksService.createSchedule(req.user, body);
  }

  @Post("schedules/expand-now")
  @Roles(RoleCode.ADMIN, RoleCode.MANAGER)
  expandNow(@Req() req: { user: { tenantId: string; pumpId?: string } }) {
    return this.tasksService.triggerScheduleExpansion(req.user);
  }
}
