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
import { subscribe } from 'diagnostics_channel';

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
    this.server.emit('serverToClient', payload);
  }

  afterInit() {
    this.logger.log('Websocket MESSAGES server initialized');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log('TEST');
  }
}
