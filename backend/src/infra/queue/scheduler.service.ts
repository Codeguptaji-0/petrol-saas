import { Injectable, OnModuleInit } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { PrismaService } from "../../prisma/prisma.service";
import { TaskStatus } from "@prisma/client";

@Injectable()
export class SchedulerService implements OnModuleInit {
  private queue!: Queue;
  private worker!: Worker;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    const connection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null
    });
    this.queue = new Queue("task-scheduler", { connection });
    this.worker = new Worker(
      "task-scheduler",
      async (job) => {
        if (job.name !== "expand-next-day-tasks") return;
        const { tenantId, pumpId } = job.data as { tenantId: string; pumpId: string };
        const schedules = await this.prisma.taskSchedule.findMany({
          where: { tenantId, pumpId, isActive: true }
        });
        if (schedules.length === 0) return;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        for (const schedule of schedules) {
          const template = await this.prisma.taskTemplate.findUnique({
            where: { id: schedule.templateId }
          });
          if (!template) continue;
          const dueAt = new Date(tomorrow);
          dueAt.setHours(18, 0, 0, 0);
          await this.prisma.task.create({
            data: {
              tenantId,
              pumpId,
              templateId: template.id,
              title: template.name,
              description: template.description ?? null,
              dueAt,
              status: TaskStatus.PENDING
            }
          });
        }
      },
      { connection }
    );
  }

  async enqueueNightlyExpansion(tenantId: string, pumpId: string): Promise<void> {
    await this.queue.add(
      "expand-next-day-tasks",
      { tenantId, pumpId },
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    );
  }
}
