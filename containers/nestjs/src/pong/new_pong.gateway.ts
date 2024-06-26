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
import { Interval } from '@nestjs/schedule';

// interface Player {
// 	id: string;
// 	x: number;
// 	score: number;
// }

const gameWidth = 400;
const gameHeight = 400;
const ballSize = 10;
const borderWidth = 5;
const paddleWidth = 10;
const paddleHeight = 100;

interface Paddle {
	y: number;
}

interface Ball {
	x: number;
	y: number;
	vx: number;
	vy: number;
}


@WebSocketGateway()
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('PongGateway');
	// private players: { [key: string]: Player } = {};
	private leftPaddle: Paddle = { y: 150 };
	private rightPaddle: Paddle = { y: 150 };
	private ball: Ball = { x: 200, y: 200, vx: 2, vy: 0 };

	afterInit(server: Server) {
		this.logger.log('WebSocket PongGateway initialized');
	}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`);
		// this.players[client.id] = { id: client.id, x: 150, score: 0 };
		this.server.emit('paddle', this.rightPaddle);
		this.server.emit('ball', this.ball);
	}
	
	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`);
		// delete this.players[client.id];
		// this.server.emit('players', this.players);
	}
	
	@SubscribeMessage('movement')
	handleMovement(client: Socket, payload: string): void {
		if (payload === 'ArrowUp') {
			this.logger.log('ArrowUp');
			this.rightPaddle.y = Math.max(0, this.rightPaddle.y - 5)
			this.server.emit('paddle', this.rightPaddle);
		}
		if (payload === 'ArrowDown') {
			this.logger.log('ArrowDown');
			this.rightPaddle.y = Math.min(gameHeight - paddleHeight, this.rightPaddle.y + 5);
			this.server.emit('paddle', this.rightPaddle);
		}
	}
	// @SubscribeMessage('movement')
	// handleMove(client: Socket, data: { x: number}) {
	// 	if (this.players[client.id]) {
	// 		this.players[client.id].x = data.x;
	// 		this.server.emit('players', this.players);
	// 	}
	// }

	resetGame = () => {
		this.ball.vx = 2;
		this.ball.vy = 0;
		this.ball.x = 200;
		this.ball.y = 200;
		// setRightPaddlePosition(150);
		// setLeftPaddlePosition(150);
	};


	@Interval(16)  // Run at approximately 60 FPS
	handleGameUpdate() {

		// Update ball position
		this.ball.x += this.ball.vx;
		this.ball.y += this.ball.vy;


		// Ball collision with paddles (add paddle collision logic here)
		const checkCollisionTopWall = (newY: number) => newY < borderWidth;
		const checkCollisionBottomWall = (newY: number) => newY > gameHeight;
		const checkCollisionLeftWall = (newX: number) => newX < 0;
		const checkCollisionRightWall = (newX: number) => newX > gameWidth - ballSize;
		const checkCollisionLeftPaddleX = (newX: number) => newX < paddleWidth + ballSize;
		const checkCollisionRightPaddleX = (newX: number) => newX > gameWidth - (paddleWidth + ballSize);
		const checkCollisionLeftPaddleY = (newY: number, leftPaddlePosition: number) => newY > leftPaddlePosition && newY < leftPaddlePosition + paddleHeight;
		const checkCollisionRightPaddleY = (newY: number, rightPaddlePosition: number) => newY > rightPaddlePosition && newY < rightPaddlePosition + paddleHeight;

		if (checkCollisionBottomWall(this.ball.y) || checkCollisionTopWall(this.ball.y)) {
			this.ball.vy = -this.ball.vy;
		}
		if (checkCollisionLeftPaddleX(this.ball.x)) {
			if (checkCollisionLeftPaddleY(this.ball.y, this.leftPaddle.y)) {
				this.ball.vx = -this.ball.vx;
				// changeBallDirection(leftPaddlePosition);
			}
		}
		if (checkCollisionRightPaddleX(this.ball.x)) {
			if (checkCollisionRightPaddleY(this.ball.y, this.rightPaddle.y)) {
				this.ball.vx = -this.ball.vx;
				// changeBallDirection(rightPaddlePosition);
			}
		}
		if (checkCollisionLeftWall(this.ball.x)) {
			// setScore(score => ({ ...score, rightPlayer: score.rightPlayer + 1 }));
			this.resetGame();
		}
		if (checkCollisionRightWall(this.ball.x)) {
			// setScore(score => ({ ...score, leftPlayer: score.leftPlayer + 1 }));
			this.resetGame();
		}

		// Emit updated state to clients
		this.server.emit('ball', this.ball);
	}
}
