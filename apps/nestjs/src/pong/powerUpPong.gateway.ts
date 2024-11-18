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
// const paddleHeight = 100;
const paddleWidth = 10;
const WinScore = 5;

interface Ball {
	x: number;
	y: number;
	vx: number;
	vy: number;
}

enum PowerUpType {
	shield = 1,
	largePaddle = 2,
	speedUp = 3,
}

@WebSocketGateway({ cors: { origin: `http://${process.env.HOST_NAME}:2424` }, namespace: 'power-up', credentials: true, allowEIO3: true })
export class PowerUpPongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('power-upPongGateway');
	private leftPaddle: number = 150;
	private rightPaddle: number = 150;
	private ball: Ball = { x: 200, y: 200, vx: 2, vy: 0 };
	private score = { left: 0, right: 0 };
	private gameInterval: NodeJS.Timeout;
	private hits: number = 0;
	private hitNumber: number = 0;
	private ShowPowerUp: boolean = false;
	private powerUpType: number = 0;
	private powerUpHeight: number = 0;
	private extraLifeRight: boolean = false;
	private extraLifeLeft: boolean = false;
	private rightPaddleSize: number = 100;
	private LeftPaddleSize: number = 100;
	private speedUpHits: number = 0;
	// private clients: Socket[] = [];

	// Function to generate a random number between 10 and 20
	private getRandomNumber(min: number = 10, max: number = 20): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	afterInit(server: Server) {
		this.logger.log('WebSocket power-upPongGateway initialized');
	}

	handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id} to power up game`);
		client.emit('startSetup', { x: this.ball.x, y: this.ball.y, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle });
	}

	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		clearInterval(this.gameInterval);
		this.resetGame(client);
	}

	@SubscribeMessage('start')
	handleStart(client: Socket): void {
		if (!this.gameInterval) {
			this.logger.log('Starting game loop');
			this.startGameLoop(client);
		}
	}

	@SubscribeMessage('movement')
	handleMovement(client: Socket, payload: string): void {
		if (payload === 'ArrowUp') {
			// this.logger.log('ArrowUp');
			this.rightPaddle = Math.max(0, this.rightPaddle - 5);
			// client.emit('rightPaddle', this.rightPaddle);
		}
		if (payload === 'ArrowDown') {
			// this.logger.log('ArrowDown');
			this.rightPaddle = Math.min(gameHeight - this.rightPaddleSize, this.rightPaddle + 5);
			// client.emit('rightPaddle', this.rightPaddle);
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

	resetGame = (client: Socket) => {
		this.ball.vx = 2;
		this.ball.vy = 0;
		this.ball.x = 200;
		this.ball.y = 200;
		this.rightPaddle = 150;
		this.leftPaddle = 150;
		this.hits = 0;
		this.ShowPowerUp = false;
		this.extraLifeRight = false;
		this.extraLifeLeft = false;
		this.rightPaddleSize = 100;
		this.LeftPaddleSize = 100;
		this.speedUpHits = 0;
		this.powerUpType = this.getRandomNumber(1, 3);
		this.hitNumber = this.getRandomNumber(2, 6);
		this.powerUpHeight = this.getRandomNumber(0, 270);
		client.emit('startSetup', { x: this.ball.x, y: this.ball.y, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle });
	};
	
	startGameLoop(client: Socket) {
		this.powerUpType = this.getRandomNumber(1, 3);
		this.hitNumber = this.getRandomNumber(2, 6);
		this.powerUpHeight = this.getRandomNumber(0, 270);
		this.gameInterval = setInterval(() => this.handleGameUpdate(client), 16);
	}
	
	changeBallDirection = (paddlePosition: number, paddleSize: number) => {
		const diff = this.ball.y - (paddlePosition + paddleSize / 2);
		this.ball.vy = diff / 20;
	};

	hitCheck = (client: Socket) => {
		if (this.hits % this.hitNumber === 0) {
			this.ShowPowerUp = true;
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
			if (this.ball.y >= this.leftPaddle && this.ball.y <= this.leftPaddle + this.LeftPaddleSize) {
				if (this.ball.vx < 0)
					this.ball.vx = -this.ball.vx;
				this.changeBallDirection(this.leftPaddle, this.LeftPaddleSize);
				this.hits += 1;
				this.hitCheck(client);
				this.logger.log('Hits: ' + this.hits);
				if (this.powerUpType === PowerUpType.speedUp && this.hits === this.speedUpHits) {
					this.ball.vx = this.ball.vx * 2;
					this.logger.log('Speeding up!!!!');
				}
				// this.logger.log('Hits: ' + this.hits);
				// this.logger.log('Hitnumber: ' + this.hitNumber);
			}
		}
		// Ball collision with right paddle
		else if (this.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
			if (this.ball.y >= this.rightPaddle && this.ball.y <= this.rightPaddle + this.rightPaddleSize) {
				if (this.ball.vx > 0)
					this.ball.vx = -this.ball.vx;
				this.changeBallDirection(this.rightPaddle, this.rightPaddleSize);
				this.hits += 1;
				this.hitCheck(client);
				this.logger.log('Hits: ' + this.hits);
				if (this.hits === this.speedUpHits) {
					this.ball.vx = this.ball.vx * 2;
					this.logger.log('Speeding up!!!!');
				}
				// this.logger.log('ball.y: ' + this.ball.y);
				// this.logger.log('bal.x : ' + this.ball.x);
			}
		}
		

		if (this.ShowPowerUp) {
			if (this.ball.x >= 185 && this.ball.x <= 215)
				if (this.ball.y >= this.powerUpHeight && this.ball.y <= (this.powerUpHeight + 30)) {
					this.ShowPowerUp = false;
					this.powerUpHeight = 0;
					client.emit('powerUpHit', this.powerUpType);
					this.logger.log('Power up hit ' + this.powerUpType);
					if (this.powerUpType === PowerUpType.shield) {
						this.logger.log('Shield hit, setting extra life');
						if (this.ball.vx < 0)
							this.extraLifeRight = true;
						else
						this.extraLifeLeft = true;
				}
				if (this.powerUpType === PowerUpType.largePaddle) {
						this.logger.log('Large paddle hit');
						if (this.ball.vx < 0) {
							this.rightPaddleSize = 150;
							client.emit('enlargePaddle', 2);
						}
						else {
							this.LeftPaddleSize = 150;
							client.emit('enlargePaddle', 1);
						}
					}
					if (this.powerUpType === PowerUpType.speedUp) {
						this.speedUpHits = this.hits + 2;
						this.logger.log('Speed up hit set at ' + this.speedUpHits);
					}
					this.powerUpType = this.getRandomNumber(1, 3);
					this.hitNumber = this.getRandomNumber(2, 5);
					this.powerUpHeight = this.getRandomNumber(0, 270);
					this.powerUpType = 1;
				}
		}

		// AI for left paddle
		if (this.ball.y > (this.leftPaddle + this.LeftPaddleSize)) {
			this.leftPaddle = Math.min(gameHeight - this.LeftPaddleSize, this.leftPaddle + 2);
			// client.emit('leftPaddle', this.leftPaddle);
		} else if (this.ball.y < this.leftPaddle) {
			this.leftPaddle = Math.max(0, this.leftPaddle - 2);
			// client.emit('leftPaddle', this.leftPaddle);
		}

		// Ball out of bounds
		if (this.ball.x <= 0 || this.ball.x >= gameWidth) {
			if (this.ball.x <= 0) {
				if (this.extraLifeLeft) {
					this.extraLifeLeft = false;
					this.ball.vx = -this.ball.vx;
					this.logger.log('Extra life used');
					return;
				}
				else {
					this.score.right += 1;
					client.emit('score', { left: this.score.left, right: this.score.right });
				}
			}
			else if (this.ball.x >= gameWidth) {
				if (this.extraLifeRight) {
					this.extraLifeRight = false;
					this.ball.vx = -this.ball.vx;
					this.logger.log('Extra life used');
					return;
				}
				else {
					this.score.left += 1;
					client.emit('score', { left: this.score.left, right: this.score.right });
				}
			}
			if (this.score.left == WinScore || this.score.right == WinScore) {
				this.score = { left: 0, right: 0 };
				client.emit('score', { left: 0, right: 0 });
				client.emit('gameover', 'Game Over');
			}
			client.emit('reset');
			this.resetGame(client);
		}

		// Emit updated state to clients
		client.emit('gameUpdate', { x: this.ball.x, y: this.ball.y, leftPaddle: this.leftPaddle, rightPaddle: this.rightPaddle });
		// client.emit('ball', { x: this.ball.x, y: this.ball.y });
		// client.emit('rightPaddle', this.rightPaddle);
		// client.emit('leftPaddle', this.leftPaddle);
	}
}