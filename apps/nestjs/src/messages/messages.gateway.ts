// Backend: messages.gateway.ts

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

interface GameInvite {
  sender_id: number;
  receiver_id: number;
  invite: boolean;
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
  private userSockets: Map<number, Socket> = new Map(); // Store user sockets directly
  private gameInvites: Map<number, GameInvite> = new Map(); // Store game invites

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

    let disconnectingUserId: number | null = null;
    this.userSockets.forEach((socket, intra_id) => {
      if (socket.id === client.id) {
        disconnectingUserId = intra_id;
        this.userSockets.delete(intra_id);
        this.logger.log(`Client deleted from userSockets: ${intra_id}`);
      }
    });

    // Delete game invites related to the disconnecting user
    if (disconnectingUserId !== null) {
      this.gameInvites.forEach((invite, key) => {
        if (
          invite.sender_id === disconnectingUserId ||
          invite.receiver_id === disconnectingUserId
        ) {
          this.gameInvites.delete(key);
          this.logger.log(
            `Deleted game invite for user: ${disconnectingUserId}, key: ${key}`,
          );
        }
      });
    }
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
    this.userSockets.set(Number(intra_user_id), client);
    this.logger.log(`user: ${intra_user_id} joined chat_id: ${chat_id}`);
    this.rooms.forEach((room) => {
      this.logger.log(
        `room_id: ${room.room_id} users: ${room.users
          .map((user) => user.intra_id)
          .join(', ')}`,
      );
    });
    // Emit gameInvite if user has a pending invite
    const gameInvite = this.gameInvites.get(Number(intra_user_id));
    if (gameInvite) {
      client.emit('gameInvite', gameInvite);
      this.logger.log(
        `Sent game invite to newly joined user: ${intra_user_id}`,
      );
    }
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
        this.logger.log(
          'Deleting game invites for user:',
          room.users[userIndex].intra_id,
        );
        this.gameInvites.delete(room.users[userIndex].intra_id);
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
        room.users.forEach((user) => {
          this.logger.log(`gameInvites for user: ${user.intra_id} deleted`);
          this.gameInvites.delete(user.intra_id);
        });
      });
    }
    client.leave(chat_id);
  }

  @SubscribeMessage('messageToServer')
  async handleMessage(client: Socket, payload: ChatMessages): Promise<void> {
    const isMuted = await this.dbService.checkIfUserIsMuted(
      payload.chat_id,
      payload.sender_id,
    );

    if (isMuted) {
      this.logger.log(
        `Client ${client.id} is muted in chat_id: ${payload.chat_id}`,
      );
      client.emit('messageFromServer', {
        ...payload,
        message: '',
        is_muted: true,
      });
      return;
    }

    const isDirectMessage = await this.dbService.checkIfDirectMessage(
      payload.chat_id,
    );
    this.logger.log(`isDirectMessage: ${isDirectMessage}`);
    if (isDirectMessage) {
      const isBlocked = await this.dbService.checkIfUserIsBlocked(
        payload.sender_id,
        payload.chat_id,
      );
      if (isBlocked) {
        this.logger.log(
          `Client ${client.id} is blocked in chat_id: ${payload.chat_id}`,
        );
        client.emit('messageFromServer', {
          ...payload,
          message: '',
          is_blocked: true,
        });
        return;
      }
    }

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
        this.dbService.updateMessageStatusReceived(user.intra_id);
        if (!isBlocked) {
          user.socket.emit('messageFromServer', fullMessage);
        } else {
          this.logger.log(
            `Client ${user.intra_id} get no update from blocked user ${payload.sender_id} in chat_id: ${fullMessage.chat_id}`,
          );
        }
      });
    }

    this.handleInboxUpdate(client);
  }

  @SubscribeMessage('inboxUpdate')
  handleInboxUpdate(_client: Socket): void {
    void _client;
    this.logger.log('Received inbox update from client');
    this.server.to('inbox').emit('chatUpdate');
    this.server.to('inbox').emit('messageUpdate');
    this.server.to('inbox').emit('statusUpdate');
  }

  @SubscribeMessage('inviteForGame')
  async handleInviteForGame(
    client: Socket,
    {
      sender_id,
      receiver_id,
      invite,
    }: { sender_id: number; receiver_id: number; invite: boolean },
  ): Promise<void> {
    this.logger.log(
      `Client ${client.id} wants to play with ${receiver_id} from ${sender_id}`,
    );

    if (invite) {
      // Store the invite
      this.gameInvites.set(receiver_id, { sender_id, receiver_id, invite });
      this.logger.log(`Game invite stored for receiver: ${receiver_id}`);
    } else {
      // Remove the invite
      this.gameInvites.delete(receiver_id);
      this.gameInvites.delete(sender_id);
      this.logger.log(`Game invite removed for receiver: ${receiver_id}`);
      this.logger.log(`Game invite removed for receiver: ${sender_id}`);
    }

    const receiverSocket = this.userSockets.get(receiver_id);
    if (receiverSocket) {
      receiverSocket.emit('gameInvite', { sender_id, receiver_id, invite });
    } else {
      this.logger.log(`Receiver socket not found for intra_id: ${receiver_id}`);
    }
  }

  @SubscribeMessage('acceptGameInvite')
  async handleAcceptGameInvite(
    client: Socket,
    {
      sender_id,
      receiver_id,
      nick_name: receiver_nick_name,
    }: { sender_id: number; receiver_id: number; nick_name: string },
  ): Promise<void> {
    this.logger.log(
      `Client ${client.id} accepted game with ${receiver_id} from ${sender_id}`,
    );

    const senderSocket = this.userSockets.get(sender_id);
    const receiverSocket = this.userSockets.get(receiver_id);

    if (senderSocket) {
      senderSocket.emit('redirectToGame', {
        player_id: receiver_id,
        nick_name: receiver_nick_name,
      });
    } else {
      this.logger.log(`Sender socket not found for intra_id: ${sender_id}`);
    }

    if (receiverSocket) {
      receiverSocket.emit('redirectToGame', {
        player_id: sender_id,
        nick_name: receiver_nick_name,
      });
    } else {
      this.logger.log(`Receiver socket not found for intra_id: ${receiver_id}`);
    }
  }
}
