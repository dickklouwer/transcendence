import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatMessages } from '@repo/db';


@WebSocketGateway({
  cors: { origin: `http://${process.env.HOST_NAME}:2424` },
  namespace: 'messages',
  credentials: true,
  allowEIO3: true,
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('MessagesGateway');

  afterInit() {
    this.logger.log('Websocket MESSAGES server initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    client: Socket,
    { chat_id, intra_user_id }: { chat_id: string; intra_user_id: string },
  ): void {
    this.logger.log(
      `Client ${client.id} user_id: ${intra_user_id} joined chat_id: ${chat_id}`,
    );
    client.join(chat_id);
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(client: Socket, chat_id: string): void {
    this.logger.log(`Client ${client.id} left chat_id: ${chat_id}`);
    client.leave(chat_id);
  }

  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, payload: ChatMessages): void {
    this.logger.log(
      `Client ${client.id} sent: ${payload.message} to chat_id: ${payload.chat_id}`,
    );

    this.server
      .to(payload.chat_id.toString())
      .emit('messageFromServer', payload);
  }
}
