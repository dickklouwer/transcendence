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
  
  interface Ball {
	x: number;
	y: number;
	vx: number;
	vy: number;
  }
  
  @WebSocketGateway({ cors: { origin: 'http://localhost:2424' }, credentials: true, allowEIO3: true })
  export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('PongGateway');
	private leftPaddle: number = 150;
	private rightPaddle: number = 150;
	private ball: Ball = { x: 200, y: 200, vx: 2, vy: 0 };
	private gameInterval: NodeJS.Timeout;
  
	afterInit(server: Server) {
	  this.logger.log('WebSocket PongGateway initialized');
	}
  
	handleConnection(client: Socket) {
	  this.logger.log(`Client connected: ${client.id}`);
	  this.logger.log(`right paddle: ${this.rightPaddle}`);
	  this.logger.log(`left paddle: ${this.leftPaddle}`);
	  client.emit('paddle', this.rightPaddle);
	  client.emit('paddle', this.leftPaddle);
	  client.emit('ball', this.ball);
	}
  
	handleDisconnect(client: Socket) {
	  this.logger.log(`Client disconnected: ${client.id}`);
	  clearInterval(this.gameInterval);
	  this.resetGame();
	}
  
	@SubscribeMessage('movement')
	handleMovement(client: Socket, payload: string): void {
	  if (payload === 'ArrowUp') {
		this.logger.log('ArrowUp');
		this.rightPaddle = Math.max(0, this.rightPaddle - 5);
		this.server.emit('rightPaddle', this.rightPaddle);
	  }
	  if (payload === 'ArrowDown') {
		this.logger.log('ArrowDown');
		this.rightPaddle = Math.min(gameHeight - paddleHeight, this.rightPaddle + 5);
		this.server.emit('rightPaddle', this.rightPaddle);
	  }
	}
  
	@SubscribeMessage('start')
	handleStart(client: Socket): void {
	  if (!this.gameInterval) {
		this.logger.log('Starting game loop');
		this.startGameLoop();
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
  
	startGameLoop() {
	  this.gameInterval = setInterval(() => this.handleGameUpdate(), 16);
	}

	changeBallDirection = (paddlePosition: number) => {
		const diff = this.ball.y - (paddlePosition + paddleHeight / 2);
		this.ball.vy = diff / 20;
	  };
  
	handleGameUpdate() {
	  // Update ball position
	  this.ball.x += this.ball.vx;
	  this.ball.y += this.ball.vy;
  
	  // Ball collision with walls
	  if (this.ball.y <= borderWidth || this.ball.y >= gameHeight - borderWidth) {
		this.ball.vy = -this.ball.vy;
	  }
  
	  // Ball collision with paddles
	  if (this.ball.x <= paddleWidth + ballSize) {
		if (this.ball.y >= this.leftPaddle && this.ball.y <= this.leftPaddle + paddleHeight) {
		  this.ball.vx = -this.ball.vx;
		  this.changeBallDirection(this.leftPaddle);
		}
	  }
	  if (this.ball.x >= gameWidth - paddleWidth - ballSize) {
		if (this.ball.y >= this.rightPaddle && this.ball.y <= this.rightPaddle + paddleHeight) {
		  this.ball.vx = -this.ball.vx;
		  this.changeBallDirection(this.rightPaddle);
		}
	  }

	  if (this.ball.y > (this.leftPaddle + paddleHeight)) {
		this.leftPaddle = Math.min(gameHeight - paddleHeight, this.leftPaddle + 5);
	  } else if (this.ball.y < this.leftPaddle) {
		this.leftPaddle = Math.max(0, this.leftPaddle - 5);
	  }
  
	  // Ball out of bounds
	  if (this.ball.x <= 0 || this.ball.x >= gameWidth) {
		this.resetGame();
	  }
  
	  // Emit updated state to clients
	  this.server.emit('ball', this.ball);
	  this.server.emit('rightPaddle', this.rightPaddle);
	  this.server.emit('leftPaddle', this.leftPaddle);
	}
  }
  