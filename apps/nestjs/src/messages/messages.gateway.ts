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
import { log } from 'console';

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

  constructor(private readonly dbService: DbService) {}

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
  async handleMessage(client: Socket, payload: ChatMessages): Promise<void> {
    this.logger.log(
      `Client ${client.id} sent: ${payload.message} to chat_id: ${payload.chat_id}`,
    );

    // check if the user is muted
    const isMuted = await this.dbService.checkIfUserIsMuted(
      payload.chat_id,
      payload.sender_id,
    );

    if (isMuted) {
      this.logger.log(
        `Client ${client.id} is muted in chat_id: ${payload.chat_id}`,
      );
      return;
    }

    // Save message to the database
    const fullMessage: ChatMessages = await this.dbService.saveMessage(payload);

    // Send to everyone in the chat room, including the sender
    this.server
      .to(fullMessage.chat_id.toString())
      .emit('messageFromServer', fullMessage);

    // Send update to the inbox chat
    log('Sending newMessage to inbox');
    this.server.to('inbox').emit('newMessage');

    // this code below is not working yet

    // // loop through all the clients in the chat room and check if a user is blocked
    // const room = this.server.sockets.adapter.rooms.get(
    //   fullMessage.chat_id.toString(),
    // );

    // if (room) {
    //   room.forEach((socketId) => {
    //     const socket = this.server.sockets.sockets.get(socketId);
    //     if (socket) {
    //       this.dbService
    //         .checkIfMessageIsBlocked(fullMessage.chat_id, fullMessage.sender_id)
    //         .then((isBlocked) => {
    //           if (!isBlocked) {
    //             this.server.to(socketId).emit('messageFromServer', fullMessage);
    //           } else {
    //             this.logger.log(
    //               `Client ${client.id} blocked user ${fullMessage.sender_id} in chat_id: ${fullMessage.chat_id}`,
    //             );
    //           }
    //         });
    //     }
    //   });
    // }
  }
}
