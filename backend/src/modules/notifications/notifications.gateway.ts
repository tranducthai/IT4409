import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Notification } from './entities/notification.entity';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly clientUsers = new WeakMap<Socket, JwtPayload>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as { token?: unknown };
      const token = typeof auth.token === 'string' ? auth.token : '';
      if (!token) throw new Error('No token');
      const payload = this.jwtService.verify<JwtPayload>(token);
      this.clientUsers.set(client, payload);
      void client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.clientUsers.delete(client);
  }

  pushToUser(userId: string, notification: Notification) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
