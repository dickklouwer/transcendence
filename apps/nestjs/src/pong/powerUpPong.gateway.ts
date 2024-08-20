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
import { number } from 'zod';

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

@WebSocketGateway({ cors: { origin: 'http://localhost:2424' }, namespace: 'power-up', credentials: true, allowEIO3: true })
export class PowerUpPongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('power-upPongGateway');
	private leftPaddle: number = 150;
	private rightPaddle: number = 150;
	private ball: Ball = { x: 200, y: 200, vx: 2, vy: 0 };
	private score = { left: 0, right: 0 };
	private gameInterval: NodeJS.Timeout;
	private hits: number = 0;
	private ShowPowerUp: boolean = false;
	private powerUpType: string = '';
	private powerUpHeight: number = 0;
	// private clients: Socket[] = [];

	// Function to generate a random number between 10 and 20
	private getRandomNumber(min: number = 10, max: number = 20): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	private hitNumber = this.getRandomNumber(0, 5);
	// private getPowerUp = () => {

	afterInit(server: Server) {
		this.logger.log('WebSocket power-upPongGateway initialized');
	}

	handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id} to power up game`);
		client.emit('startSetup', {x: this.ball.x, y: this.ball.y, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle});
		// client.emit('ball', {x: this.ball.x, y: this.ball.y});
		// client.emit('rightPaddle', this.rightPaddle);
		// client.emit('leftPaddle', this.leftPaddle);
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		clearInterval(this.gameInterval);
		this.resetGame();
	}

	@SubscribeMessage('movement')
	handleMovement(client: Socket, payload: string): void {
		if (payload === 'ArrowUp') {
			// this.logger.log('ArrowUp');
			this.rightPaddle = Math.max(0, this.rightPaddle - 5);
			client.emit('rightPaddle', this.rightPaddle);
		}
		if (payload === 'ArrowDown') {
			// this.logger.log('ArrowDown');
			this.rightPaddle = Math.min(gameHeight - paddleHeight, this.rightPaddle + 5);
			client.emit('rightPaddle', this.rightPaddle);
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
		this.hits = 0;
	};

	startGameLoop(client: Socket) {
		this.gameInterval = setInterval(() => this.handleGameUpdate(client), 16);
	}

	changeBallDirection = (paddlePosition: number) => {
		const diff = this.ball.y - (paddlePosition + paddleHeight / 2);
		this.ball.vy = diff / 20;
	};
	
	hitCheck = (client: Socket) => {
		if (this.hits === this.hitNumber) {
			this.ShowPowerUp = true;
			this.powerUpType = 'shield';
			this.powerUpHeight = this.getRandomNumber(0, 270);
			client.emit('showPowerUp', { powerUpType: this.powerUpType, powerUpHeight: this.powerUpHeight });
			this.logger.log('PowerUpheight: ' + this.powerUpHeight);
		}
	}

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
			if (this.ball.y >= this.leftPaddle && this.ball.y <= this.leftPaddle + paddleHeight) {
				this.ball.vx = -this.ball.vx;
				this.hits += 1;
				this.hitCheck(client);
				this.logger.log('Hits: ' + this.hits);
				this.logger.log('Hitnumber: ' + this.hitNumber);
				this.changeBallDirection(this.leftPaddle);
			}
		}
		// Ball collision with right paddle
		else if (this.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
			if (this.ball.y >= this.rightPaddle && this.ball.y <= this.rightPaddle + paddleHeight) {
				this.ball.vx = -this.ball.vx;
				this.hits += 1;
				this.hitCheck(client);
				// this.logger.log('Hits: ' + this.hits);
				// this.logger.log('ball.y: ' + this.ball.y);
				// this.logger.log('bal.x : ' + this.ball.x);
				// this.logger.log('rightPaddle: ' + this.rightPaddle);
				this.changeBallDirection(this.rightPaddle);
			}
		}


		if (this.ShowPowerUp) {
			if (this.ball.x <= 185 && this.ball.x <= 215)
				if (this.ball.y >= this.powerUpHeight && this.ball.y <= this.powerUpHeight + 30) {
					this.ShowPowerUp = false;
					this.powerUpType = '';
					this.powerUpHeight = 0;
					client.emit('powerUpHit', { powerUpType: this.powerUpType, powerUpHeight: this.powerUpHeight });
				}
		}

		// AI for left paddle
		if (this.ball.y > (this.leftPaddle + paddleHeight)) {
			this.leftPaddle = Math.min(gameHeight - paddleHeight, this.leftPaddle + 2);
			client.emit('leftPaddle', this.leftPaddle);
		} else if (this.ball.y < this.leftPaddle) {
			this.leftPaddle = Math.max(0, this.leftPaddle - 2);
			client.emit('leftPaddle', this.leftPaddle);
		}

		// Ball out of bounds
		if (this.ball.x <= 0 || this.ball.x >= gameWidth) {
			if (this.ball.x <= 0) {
				this.score.right += 1;
				client.emit('score', { left: this.score.left, right: this.score.right });
			}
			else if (this.ball.x >= gameWidth) {
				this.score.left += 1;
				client.emit('score', { left: this.score.left, right: this.score.right });
			}
			if (this.score.left == WinScore || this.score.right == WinScore) {
				this.score = { left: 0, right: 0 };
				client.emit('score', { left: 0, right: 0 });
				client.emit('gameover', 'Game Over');
			}
			this.resetGame();
		}

		// Emit updated state to clients
		client.emit('ball', {x: this.ball.x, y: this.ball.y});
		// client.emit('rightPaddle', this.rightPaddle);
		// client.emit('leftPaddle', this.leftPaddle);
	}
}
