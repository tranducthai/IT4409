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

    constructor(
        private readonly jwtService: JwtService,
        private readonly messagesService: MessagesService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token as string;
            if (!token) throw new Error('No token');
            const payload = this.jwtService.verify(token);
            client.data.user = payload;
        } catch {
            client.disconnect(true);
        }
    }

    handleDisconnect(_client: Socket) { }

    @SubscribeMessage('joinDiscussion')
    handleJoin(
        @ConnectedSocket() client: Socket,
        @MessageBody() discussionId: string,
    ) {
        client.join(`discussion:${discussionId}`);
        return { joined: discussionId };
    }

    @SubscribeMessage('leaveDiscussion')
    handleLeave(
        @ConnectedSocket() client: Socket,
        @MessageBody() discussionId: string,
    ) {
        client.leave(`discussion:${discussionId}`);
    }

    @SubscribeMessage('sendMessage')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { discussionId: string; content: string; imageUrl?: string },
    ) {
        if (!client.data?.user) throw new WsException('Unauthorized');

        try {
            const dto: CreateMessageDto = {
                discussion_id: data.discussionId,
                content: data.content,
                image_url: data.imageUrl ?? undefined,
            };
            const message = await this.messagesService.createAndReturn(
                client.data.user.sub,
                dto,
            );
            this.server.to(`discussion:${data.discussionId}`).emit('newMessage', message);
            return { success: true };
        } catch (error) {
            return { error: (error as Error).message || 'Gửi tin nhắn thất bại' };
        }
    }
}
