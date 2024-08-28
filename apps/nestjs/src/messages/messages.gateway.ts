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

type ChatMessage = {
  message_id: number;
  sender_id: number;
  group_chat_id: number | null;
  message: string;
  sent_at: string;
};

@WebSocketGateway({
  cors: { origin: 'http://localhost:2424' },
  namespace: 'messages',
  credentials: true,
  allowEIO3: true,
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('MessagesGateway');

  @SubscribeMessage('clientToServer')
  handleMessage(client: Socket, payload: string): void {
    this.logger.log(`Client ${client.id} sent: ${payload}`);

    // if (false) {
    //   // to specific users
    //   const room = payload.group_chat_id
    //     ? `group_${payload.group_chat_id}`
    //     : `private_${payload.sender_id}_${client.id}`;

    //   client.join(room);
    //   this.server.to(room).emit('serverToClient', payload);
    // } else {
    //   // to all users
    this.server.emit('serverToClient', payload);
    // }
  }

  afterInit() {
    this.logger.log('Websocket MESSAGES server initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
