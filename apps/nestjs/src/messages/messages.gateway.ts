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

type userData = {
  socket: Socket;
  chat_ids: number[];
};

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
  private usersData: userData[] = [];

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // get the intra_user_id from the client
    const intra_user_id = client.handshake.query.intra_user_id;
    this.logger.log(
      `Client connected: ${client.id}, intra_user_id: ${intra_user_id}`,
    );
    const chat_ids = [1, 2, 3]; // todo: get chat_ids from the database
    this.usersData.push({ socket: client, chat_ids: chat_ids });
  }

  afterInit() {
    this.logger.log('Websocket MESSAGES server initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, payload: ChatMessages): void {
    this.logger.log(`Client ${client.id} sent: ${payload}`);

    this.usersData.forEach((user) => {
      if (user.chat_ids.includes(payload.chat_id)) {
        user.socket.emit('messageFromServer', payload);
      }
    });

    // update db
  }
}
