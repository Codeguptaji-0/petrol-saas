import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "/realtime", cors: true })
export class RealtimeGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    const { tenantId, pumpId, userId } = client.handshake.auth ?? {};
    if (tenantId) client.join(`tenant:${tenantId as string}`);
    if (pumpId) client.join(`pump:${pumpId as string}`);
    if (userId) client.join(`user:${userId as string}`);
  }

  @SubscribeMessage("task.updated")
  onTaskUpdated(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { tenantId: string; payload: unknown }
  ) {
    client.to(`tenant:${body.tenantId}`).emit("task.updated", body.payload);
  }
}
