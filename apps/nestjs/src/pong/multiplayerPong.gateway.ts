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

const gameWidth = 400;
const gameHeight = 400;
const ballSize = 10;
const borderWidth = 5;
const paddleWidth = 10;
const paddleHeight = 100;
const WinScore = 5;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@WebSocketGateway({
  cors: { origin: 'http://localhost:2424' },
  namespace: 'pong',
  credentials: true,
  allowEIO3: true,
})
export class PongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('PongGateway');
  private leftPaddle: number = 150;
  private rightPaddle: number = 150;
  private ball: Ball = { x: 200, y: 200, vx: 2, vy: 0 };
  private score = { left: 0, right: 0 };
  private gameInterval: NodeJS.Timeout;
  private clients: Socket[] = [];

  afterInit(server: Server) {
    this.logger.log('WebSocket PongGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.log(`Clients size: ${this.clients.length}`);
    this.clients.push(client);
    if (this.clients.length < 2) {
      this.server.emit('awaitPlayer', 'Awaiting Player');
      this.logger.log(`awaiting player`);
    } else if (this.clients.length == 2)
      this.server.emit('playersReady', 'Players Ready');
    // client.emit('rightPaddle', this.rightPaddle);
    // client.emit('leftPaddle', this.leftPaddle);
    this.server.emit('ball', this.ball);
    this.server.emit('rightPaddle', this.rightPaddle);
    this.server.emit('leftPaddle', this.leftPaddle);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients = this.clients.filter((c) => c.id !== client.id);
    clearInterval(this.gameInterval);
    this.resetGame();
  }

  @SubscribeMessage('movement')
  handleMovement(client: Socket, payload: string): void {
    this.logger.log(`Client id: ${client.id}`);
    this.logger.log(`Clientd 0 id: ${this.clients[0].id}`);
    this.logger.log(`Clientd 1 id: ${this.clients[1].id}`);
    if (client.id === this.clients[0].id) {
      this.logger.log(`Client payload: ${payload}`);
      this.movePaddle('left', payload);
    } else if (client.id === this.clients[1].id) {
      this.logger.log(`Client payload: ${payload}`);
      this.movePaddle('right', payload);
    }
    // if (payload === 'ArrowUp') {
    // 	this.logger.log('ArrowUp');
    // 	this.rightPaddle = Math.max(0, this.rightPaddle - 5);
    // 	this.server.emit('rightPaddle', this.rightPaddle);
    // }
    // if (payload === 'ArrowDown') {
    // 	this.logger.log('ArrowDown');
    // 	this.rightPaddle = Math.min(gameHeight - paddleHeight, this.rightPaddle + 5);
    // 	this.server.emit('rightPaddle', this.rightPaddle);
    // }
  }

  movePaddle(side: string, payload: string): void {
    if (side === 'left') this.moveLeftPaddle(payload);
    else if (side === 'right') this.moveRightPaddle(payload);
  }

  moveLeftPaddle(payload: string): void {
    if (payload === 'ArrowUp') {
      this.logger.log('ArrowUp');
      this.leftPaddle = Math.max(0, this.leftPaddle - 5);
      this.server.emit('leftPaddle', this.leftPaddle);
    }
    if (payload === 'ArrowDown') {
      this.logger.log('ArrowDown');
      this.leftPaddle = Math.min(
        gameHeight - paddleHeight,
        this.leftPaddle + 5,
      );
      this.server.emit('leftPaddle', this.leftPaddle);
    }
  }

  moveRightPaddle(payload: string): void {
    if (payload === 'ArrowUp') {
      this.logger.log('ArrowUp');
      this.rightPaddle = Math.max(0, this.rightPaddle - 5);
      this.server.emit('rightPaddle', this.rightPaddle);
    }
    if (payload === 'ArrowDown') {
      this.logger.log('ArrowDown');
      this.rightPaddle = Math.min(
        gameHeight - paddleHeight,
        this.rightPaddle + 5,
      );
      this.server.emit('rightPaddle', this.rightPaddle);
    }
  }

  @SubscribeMessage('start')
  handleStart(client: Socket): void {
    if (!this.gameInterval) {
      this.logger.log('Starting game loop');
      this.startGameLoop(client);
    }
  }

  @SubscribeMessage('stop')
  handleStop(client: Socket): void {
    if (this.gameInterval) {
      this.logger.log('Stopping game loop');
      clearInterval(this.gameInterval);
      this.gameInterval = undefined;
    }
  }

  resetGame = () => {
    this.ball.vx = 2;
    this.ball.vy = 0;
    this.ball.x = 200;
    this.ball.y = 200;
    this.rightPaddle = 150;
  };

  startGameLoop(client: Socket) {
    this.gameInterval = setInterval(() => this.handleGameUpdate(client), 16);
  }

  changeBallDirection = (paddlePosition: number) => {
    const diff = this.ball.y - (paddlePosition + paddleHeight / 2);
    this.ball.vy = diff / 20;
  };

  handleGameUpdate(client: Socket) {
    // Update ball position
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Ball collision with walls
    if (this.ball.y <= borderWidth || this.ball.y >= gameHeight - borderWidth) {
      this.ball.vy = -this.ball.vy;
    }

    // Ball collision with left paddle
    if (this.ball.x <= paddleWidth + ballSize + 4) {
      if (
        this.ball.y >= this.leftPaddle &&
        this.ball.y <= this.leftPaddle + paddleHeight
      ) {
        this.ball.vx = -this.ball.vx;
        this.changeBallDirection(this.leftPaddle);
      }
    }
    // Ball collision with right paddle
    else if (this.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
      if (
        this.ball.y >= this.rightPaddle &&
        this.ball.y <= this.rightPaddle + paddleHeight
      ) {
        this.ball.vx = -this.ball.vx;
        this.changeBallDirection(this.rightPaddle);
      }
    }

    // Ball out of bounds
    if (this.ball.x <= 0 || this.ball.x >= gameWidth) {
      if (this.ball.x <= 0) {
        this.score.right += 1;
        this.server.emit('score', {
          left: this.score.left,
          right: this.score.right,
        });
      } else if (this.ball.x >= gameWidth) {
        this.score.left += 1;
        this.server.emit('score', {
          left: this.score.left,
          right: this.score.right,
        });
      }
      if (this.score.left == WinScore || this.score.right == WinScore) {
        this.score = { left: 0, right: 0 };
        this.server.emit('score', { left: 0, right: 0 });
        this.server.emit('gameover', 'Game Over');
      }
      this.resetGame();
    }

    // Emit updated state to clients
    this.server.emit('ball', this.ball);
    this.server.emit('rightPaddle', this.rightPaddle);
    this.server.emit('leftPaddle', this.leftPaddle);
  }
}
