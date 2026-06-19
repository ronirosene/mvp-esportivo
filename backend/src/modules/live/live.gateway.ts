import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/live',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(LiveGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    this.logger.log(`client connected socketId=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`client disconnected socketId=${client.id}`);
  }

  @SubscribeMessage('joinOrganization')
  handleJoinOrganization(client: Socket, organizationId: string) {
    const room = `organization:${organizationId}`;
    client.join(room);
    this.logger.log(`socketId=${client.id} joined room=${room}`);
  }

  @SubscribeMessage('leaveOrganization')
  handleLeaveOrganization(client: Socket, organizationId: string) {
    const room = `organization:${organizationId}`;
    client.leave(room);
    this.logger.log(`socketId=${client.id} left room=${room}`);
  }

  @SubscribeMessage('joinEvent')
  handleJoinEvent(client: Socket, eventId: string) {
    const room = `event:${eventId}`;
    client.join(room);
    this.logger.log(`socketId=${client.id} joined room=${room}`);
  }

  @SubscribeMessage('leaveEvent')
  handleLeaveEvent(client: Socket, eventId: string) {
    const room = `event:${eventId}`;
    client.leave(room);
    this.logger.log(`socketId=${client.id} left room=${room}`);
  }

  @SubscribeMessage('joinSport')
  handleJoinSport(client: Socket, eventSportId: string) {
    const room = `sport:${eventSportId}`;
    client.join(room);
    this.logger.log(`socketId=${client.id} joined room=${room}`);
  }

  @SubscribeMessage('leaveSport')
  handleLeaveSport(client: Socket, eventSportId: string) {
    const room = `sport:${eventSportId}`;
    client.leave(room);
    this.logger.log(`socketId=${client.id} left room=${room}`);
  }

  @SubscribeMessage('joinMatch')
  handleJoinMatch(client: Socket, matchId: string) {
    const room = `match:${matchId}`;
    client.join(room);
    this.logger.log(`socketId=${client.id} joined room=${room}`);
  }

  @SubscribeMessage('leaveMatch')
  handleLeaveMatch(client: Socket, matchId: string) {
    const room = `match:${matchId}`;
    client.leave(room);
    this.logger.log(`socketId=${client.id} left room=${room}`);
  }

  emitToMatch(matchId: string, event: string, data: any) {
    this.server?.to(`match:${matchId}`).emit(event, data);
  }

  emitToEventSport(eventSportId: string, event: string, data: any) {
    this.server?.to(`sport:${eventSportId}`).emit(event, data);
  }

  emitToEvent(eventId: string, event: string, data: any) {
    this.server?.to(`event:${eventId}`).emit(event, data);
  }

  emitToOrganization(organizationId: string, event: string, data: any) {
    this.server?.to(`organization:${organizationId}`).emit(event, data);
  }
}
