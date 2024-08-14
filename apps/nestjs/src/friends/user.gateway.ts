import {
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: 'http://localhost:2424' },
  namespace: 'user',
  credentials: true,
  allowEIO3: true,
})
export class UserGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private clients: Map<number, Socket> = new Map<number, Socket>();

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('UserGateway');

  @SubscribeMessage('FriendRequestNotification')
  handleMessage(client: Socket, friend_id: number) {
    const friend_client = this.clients.get(friend_id);
    this.logger.log(`Friend request sent to: ${friend_id}`);
    if (friend_client) {
      friend_client.emit('sendFriendRequest', 'You have a new friend request!');
    } else {
      this.logger.log('Friend not registered');
    }
  }

  @SubscribeMessage('registerUserId')
  handleRegisterUser(client: Socket, intra_user_id: number) {
    this.clients.set(intra_user_id, client);
    console.log(intra_user_id);
    this.logger.log(`Client registered: ${client.id}`);
  }

  afterInit() {
    this.logger.log('Initialized! Friends Socket');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
