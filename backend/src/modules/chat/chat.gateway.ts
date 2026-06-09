import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateMessageDto } from '../messages/dtos/create-message.dto';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly clientUsers = new WeakMap<Socket, JwtPayload>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly messagesService: MessagesService,
  ) {}

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
    this.clientUsers.delete(client);
  }

  @SubscribeMessage('joinDiscussion')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() discussionId: string,
  ) {
    void client.join(`discussion:${discussionId}`);
    return { joined: discussionId };
  }

  @SubscribeMessage('leaveDiscussion')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() discussionId: string,
  ) {
    void client.leave(`discussion:${discussionId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { discussionId: string; content: string; imageUrl?: string },
  ) {
    const user = this.clientUsers.get(client);
    if (!user) throw new WsException('Unauthorized');

    try {
      const dto: CreateMessageDto = {
        discussion_id: data.discussionId,
        content: data.content,
        image_url: data.imageUrl ?? undefined,
      };
      const message = await this.messagesService.createAndReturn(user.sub, dto);
      this.server
        .to(`discussion:${data.discussionId}`)
        .emit('newMessage', message);
      return { success: true, message };
    } catch (error) {
      return { error: (error as Error).message || 'Gửi tin nhắn thất bại' };
    }
  }
}
