import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

interface Participant {
  userId: string;
  name: string;
  socketId: string;
}

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/video-call',
  transports: ['websocket', 'polling'],
})
export class VideoCallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly clientUsers = new WeakMap<Socket, JwtPayload>();
  // classId → Map<socketId, Participant>
  private readonly rooms = new Map<string, Map<string, Participant>>();

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth as { token?: unknown };
      const token = typeof auth.token === 'string' ? auth.token : '';
      if (!token) throw new Error('No token');
      const payload = this.jwtService.verify<JwtPayload>(token);
      this.clientUsers.set(client, payload);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.clientUsers.get(client);
    if (user) {
      for (const [classId, participants] of this.rooms.entries()) {
        if (participants.has(client.id)) {
          participants.delete(client.id);
          client.to(`call:${classId}`).emit('user-left', { socketId: client.id });
          if (participants.size === 0) this.rooms.delete(classId);
        }
      }
    }
    this.clientUsers.delete(client);
  }

  @SubscribeMessage('join-call')
  handleJoinCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { classId: string; name: string },
  ) {
    const user = this.clientUsers.get(client);
    if (!user) return;

    const { classId, name } = data;

    if (!this.rooms.has(classId)) this.rooms.set(classId, new Map());

    const room = this.rooms.get(classId)!;
    const existingParticipants = Array.from(room.values());

    const participant: Participant = {
      userId: user.sub,
      name: name || user.email,
      socketId: client.id,
    };

    room.set(client.id, participant);
    void client.join(`call:${classId}`);

    // Tell new joiner who's already there
    client.emit('call-joined', { participants: existingParticipants });
    // Tell others a new person joined
    client.to(`call:${classId}`).emit('user-joined', participant);

    return { joined: true };
  }

  @SubscribeMessage('leave-call')
  handleLeaveCall(
    @ConnectedSocket() client: Socket,
    @MessageBody() classId: string,
  ) {
    const room = this.rooms.get(classId);
    if (room) {
      room.delete(client.id);
      if (room.size === 0) this.rooms.delete(classId);
    }
    void client.leave(`call:${classId}`);
    client.to(`call:${classId}`).emit('user-left', { socketId: client.id });
    return { left: true };
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: string; sdp: unknown },
  ) {
    this.server.to(data.to).emit('offer', { from: client.id, sdp: data.sdp });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: string; sdp: unknown },
  ) {
    this.server.to(data.to).emit('answer', { from: client.id, sdp: data.sdp });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { to: string; candidate: unknown },
  ) {
    this.server.to(data.to).emit('ice-candidate', { from: client.id, candidate: data.candidate });
  }
}
