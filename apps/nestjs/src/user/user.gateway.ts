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
import { DbService } from '../db/db.service';

if (!process.env.FRONT_END_URL) {
  throw Error('Env DATABASE_URL is undefined');
}

@WebSocketGateway({
  cors: { origin: "http://localhost:2424" },
  namespace: 'user',
  credentials: true,
  allowEIO3: true,
})
export class UserGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('UserGateway');
  private clients: Map<number, Socket> = new Map<number, Socket>();

  constructor(private readonly dbService: DbService) {}

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
    this.setUserState({ intra_user_id, state: 'Online' });
    this.logger.log(`Client registered: ${client.id}`);
  }

  @SubscribeMessage('setUserStateToIn-Game')
  handleSetUserState(client: Socket) {
    this.clients.forEach((clients, intra_user_id) => {
      if (clients === client) {
        this.setUserState({ intra_user_id, state: 'In-Game' });
      }
    });
  }

  afterInit() {
    this.logger.log('Initialized! Friends Socket');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.forEach((clients, intra_user_id) => {
      if (clients === client) {
        this.setUserState({ intra_user_id, state: 'Offline' });
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async setUserState({
    intra_user_id,
    state,
  }: {
    intra_user_id: number;
    state: 'Online' | 'Offline' | 'In-Game';
  }) {
    await this.dbService.setUserState(intra_user_id, state);

    const friends = await this.dbService.getAnyApprovedFriends(intra_user_id);

    friends.forEach((friend) => {
      const friend_client = this.clients.get(friend.intra_user_id);
      if (friend_client) {
        friend_client.emit('statusChange');
      }
    });

    this.logger.log(`User state changed: ${intra_user_id} to ${state}`);
  }
}
