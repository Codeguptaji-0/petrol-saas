import { Injectable } from "@nestjs/common";
import { RoleCode, ScheduleType, TaskStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { SchedulerService } from "../../infra/queue/scheduler.service";

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerService: SchedulerService
  ) {}

  create(
    user: { tenantId: string; pumpId?: string },
    dto: CreateTaskDto
  ) {
    return this.prisma.task.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        assignedToUserId: dto.assignedToUserId,
        title: dto.title,
        description: dto.description,
        dueAt: new Date(dto.dueAt),
        status: TaskStatus.PENDING
      }
    });
  }

  myTasks(user: { id: string; tenantId: string }) {
    return this.prisma.task.findMany({
      where: { tenantId: user.tenantId, assignedToUserId: user.id },
      orderBy: { dueAt: "asc" }
    });
  }

  createTemplate(user: { tenantId: string }, payload: { name: string; roleTarget: RoleCode }) {
    return this.prisma.taskTemplate.create({
      data: {
        tenantId: user.tenantId,
        name: payload.name,
        roleTarget: payload.roleTarget
      }
    });
  }

  createSchedule(
    user: { tenantId: string; pumpId?: string },
    payload: { templateId: string; scheduleType: ScheduleType; cronExpr?: string }
  ) {
    return this.prisma.taskSchedule.create({
      data: {
        tenantId: user.tenantId,
        pumpId: user.pumpId ?? "",
        templateId: payload.templateId,
        scheduleType: payload.scheduleType,
        cronExpr: payload.cronExpr
      }
    });
  }

  async triggerScheduleExpansion(user: { tenantId: string; pumpId?: string }) {
    await this.schedulerService.enqueueNightlyExpansion(user.tenantId, user.pumpId ?? "");
    return { queued: true };
  }
}
