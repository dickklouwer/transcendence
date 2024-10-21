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
import { DbService } from '../db/db.service';

interface Users {
  intra_id: number;
  socket: Socket;
}

interface Room {
  room_id: number;
  users: Users[];
}

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
  private rooms: Map<number, Room> = new Map();

  constructor(private readonly dbService: DbService) {}

  afterInit() {
    this.logger.log('Websocket MESSAGES server initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log('Client connected and joined inbox:', client.id);
    client.join('inbox');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected and leaved inbox: ${client.id}`);
    client.leave('inbox');
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
    this.rooms.set(Number(chat_id), {
      room_id: Number(chat_id),
      users: [
        ...(this.rooms.get(Number(chat_id))?.users || []),
        { intra_id: Number(intra_user_id), socket: client },
      ],
    });
    this.logger.log(`user: ${intra_user_id} joined chat_id: ${chat_id}`);
    this.rooms.forEach((room) => {
      this.logger.log(
        `room_id: ${room.room_id} users: ${room.users
          .map((user) => user.intra_id)
          .join(', ')}`,
      );
    });
  }

  @SubscribeMessage('leaveChat')
  handleLeaveChat(client: Socket, chat_id: string): void {
    this.logger.log(`Client ${client.id} left chat_id: ${chat_id}`);
    const room = this.rooms.get(Number(chat_id));
    if (room) {
      const userIndex = room.users.findIndex(
        (user) => user.socket.id === client.id,
      );
      if (userIndex !== -1) {
        this.logger.log(
          `User ${room.users[userIndex].intra_id} left chat_id: ${chat_id}`,
        );
        room.users.splice(userIndex, 1);
      }
      this.rooms.set(Number(chat_id), room);
    }
    if (room?.users.length === 0) {
      this.logger.log(`room_id: ${chat_id} is empty and deleted`);
      this.rooms.delete(Number(chat_id));
    } else {
      this.rooms.forEach((room) => {
        this.logger.log(
          `room_id: ${room.room_id} users: ${room.users
            .map((user) => user.intra_id)
            .join(', ')}`,
        );
      });
    }
    client.leave(chat_id);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(client: Socket, payload: ChatMessages): Promise<void> {

    // check if the user is muted
    const isMuted = await this.dbService.checkIfUserIsMuted(
      payload.chat_id,
      payload.sender_id,
    );

    if (isMuted) {
      this.logger.log(
        `Client ${client.id} is muted in chat_id: ${payload.chat_id}`,
      );
      // Send to the sender only that he is muted
      client.emit('messageFromServer', {
        ...payload,
        message: '',
        is_muted: true,
      });
      return;
    }

    // Save message to the database
    const fullMessage: ChatMessages = await this.dbService.saveMessage(payload);

    const room = this.rooms.get(fullMessage.chat_id);
    this.logger.log(
      `Chat id: ${fullMessage.chat_id}, Sender id: ${fullMessage.sender_id}, Message: ${fullMessage.message}`,
    );
    if (room) {
      room.users.forEach(async (user) => {
        const isBlocked = await this.dbService.checkIfUserIsBlocked(
          fullMessage.sender_id,
          user.intra_id,
        );
        this.logger.log(
          `Chat id: ${fullMessage.chat_id}, Receiver id: ${user.intra_id}, Blocked = ${isBlocked}`,
        );
        if (!isBlocked) {
          user.socket.emit('messageFromServer', fullMessage);
        }
      });
    }

    this.server.to('inbox').emit('inboxUpdate');
  }
}
