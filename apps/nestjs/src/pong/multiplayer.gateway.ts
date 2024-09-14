// import {
// 	SubscribeMessage,
// 	WebSocketGateway,
// 	OnGatewayInit,
// 	OnGatewayConnection,
// 	OnGatewayDisconnect,
// 	WebSocketServer,
// } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';
// import {
// 	users,
// 	messages,
// 	groupChats,
// 	createQueryClient,
// 	createDrizzleClient,
// 	games,
// } from '@repo/db';
// import type { User } from '@repo/db';
// import { eq, or, sql } from 'drizzle-orm';

// const gameWidth = 400;
// const gameHeight = 400;
// const ballSize = 10;
// const borderWidth = 5;
// const paddleWidth = 10;
// const paddleHeight = 100;
// const WinScore = 5;

// interface Ball {
// 	x: number;
// 	y: number;
// 	vx: number;
// 	vy: number;
// }

// interface Room {
// 	roomID: string;
// 	players: Player[];
// 	ball: Ball;
// 	rematch: number;
// 	isPowerUpGame: boolean;
// 	hits: number;
// 	showPowerUp: boolean;
// 	powerUpType: number;
// 	powerUpHeight: number;
// 	extraLifeLeft: boolean;
// 	extraLifeRight: boolean;
// 	leftPaddleSize: number;
// 	rightPaddleSize: number;
// 	speedUpHits: number;
// 	hitNumber: number;
// }

// interface Player {
// 	client: Socket | null;
// 	paddle: number;
// 	score: number;
// }

// enum PowerUpType {
// 	shield = 1,
// 	largePaddle = 2,
// 	speedUp = 3,
// }

// @WebSocketGateway({
// 	cors: { origin: 'http://localhost:2424' },
// 	namespace: 'multiplayer',
// 	credentials: true,
// 	allowEIO3: true,
// })
// export class CombinedPongGateway
// 	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
// 	@WebSocketServer() server: Server;
// 	private logger: Logger = new Logger('CombinedPongGateway');
// 	private gameInterval: NodeJS.Timeout;
// 	private clients: Socket[] = [];
// 	private roomIdCounter = 1;
// 	private rooms: Map<string, Room> = new Map();
// 	private clientRoomMap: Map<string, string> = new Map();

// 	private createPlayer(client: Socket | null): Player {
// 		return { client: client, paddle: 150, score: 0 };
// 	}

// 	private createRoom(roomID: string, players: Player[], ball: Ball, isPowerUpGame: boolean): Room {
// 		return {
// 			roomID,
// 			players,
// 			ball,
// 			rematch: 0,
// 			isPowerUpGame,
// 			hits: 0,
// 			showPowerUp: false,
// 			powerUpType: this.getRandomNumber(1, 3),
// 			powerUpHeight: this.getRandomNumber(0, 270),
// 			hitNumber: this.getRandomNumber(2, 6),
// 			extraLifeLeft: false,
// 			extraLifeRight: false,
// 			leftPaddleSize: paddleHeight,
// 			rightPaddleSize: paddleHeight,
// 			speedUpHits: 0,
// 		};
// 	}

// 	private createBall(): Ball {
// 		return { x: 200, y: 200, vx: 2, vy: 0 };
// 	}

// 	private getRandomNumber(min: number = 10, max: number = 20): number {
// 		return Math.floor(Math.random() * (max - min + 1)) + min;
// 	}

// 	afterInit(server: Server) {
// 		this.logger.log('WebSocket CombinedPongGateway initialized');
// 	}

// 	handleConnection(client: Socket) {
// 		this.logger.log(`Client connected: ${client.id} to pong game`);
// 		this.clients.push(client);
// 	}

// 	handleDisconnect(client: Socket) {
// 		this.logger.log(`Client disconnected: ${client.id}`);
// 		const roomId = this.clientRoomMap.get(client.id);
// 		if (roomId) {
// 			const room = this.rooms.get(roomId);
// 			if (room) {
// 				if (room.isPowerUpGame) {
// 					room.players = room.players.filter((player) => player.client?.id !== client.id);
// 					if (room.players.length > 0) {
// 						room.players[0].client?.emit('awaitPlayer', 'Awaiting Player');
// 					}
// 				} else {
// 					if (client.id === room.players[0].client.id)
// 						this.insertGameScore(
// 							room.players[0].client.data.intra_id,
// 							room.players[1].client.data.intra_id,
// 							room.players[0].score,
// 							5,
// 						);
// 					else
// 						this.insertGameScore(
// 							room.players[0].client.data.intra_id,
// 							room.players[1].client.data.intra_id,
// 							5,
// 							room.players[1].score,
// 						);
// 				}
// 				this.rooms.delete(roomId);
// 			}
// 			this.clients = this.clients.filter((c) => c.id !== client.id);
// 			this.clientRoomMap.delete(client.id);
// 		}
// 	}

// 	@SubscribeMessage('powerUp game')
// 	handlePowerUpGame(client: Socket): void {
// 		this.logger.log('PowerUp Game');
// 		this.setupGame(client, true);
// 	}
	
// 	@SubscribeMessage('normal game')
// 	handleNormalGame(client: Socket): void {
// 		this.logger.log('normal Game');
// 		this.setupGame(client, false);
// 	}

// 	private setupGame(client: Socket, isPowerUpGame: boolean): void {
// 		if (this.clients.length > 0 && this.clients.length % 2 === 0) {
// 			const roomId = `room_${this.roomIdCounter++}`;
// 			const firstClient = this.clients[this.clients.length - 2];
// 			const secondClient = client;

// 			const leftPlayer = this.createPlayer(firstClient);
// 			const rightPlayer = this.createPlayer(secondClient);
// 			const players = [leftPlayer, rightPlayer];
// 			const ball = this.createBall();
// 			const room = this.createRoom(roomId, players, ball, isPowerUpGame);

// 			this.rooms.set(roomId, room);
// 			this.clientRoomMap.set(firstClient.id, roomId);
// 			this.clientRoomMap.set(secondClient.id, roomId);

// 			this.logger.log(`Room created: ${roomId} with players ${firstClient.id} and ${secondClient.id}`);

// 			firstClient.join(roomId);
// 			secondClient.join(roomId);

// 			this.server.to(roomId).emit('startSetup', {
// 				x: room.ball.x,
// 				y: room.ball.y,
// 				leftPaddle: room.players[0].paddle,
// 				rightPaddle: room.players[1].paddle,
// 				// isPowerUpGame: room.isPowerUpGame,
// 			});

// 			setTimeout(() => {
// 				this.startGameLoop(room);
// 			}, 3000);
// 		} else {
// 			client.emit('awaitPlayer');
// 			this.logger.log('client waiting, client length: ' + this.clients.length);
// 		}
// 	}

// 	@SubscribeMessage('registerUser')
// 	handleRegistration(
// 		client: Socket,
// 		payload: { intra_id: number; user_name: string },
// 	): void {
// 		client.data.intra_id = payload.intra_id;
// 		client.data.user_name = payload.user_name;
// 		const roomId = this.clientRoomMap.get(client.id);
// 		const room = this.rooms.get(roomId);
// 		if (room) {
// 			const player1 = room.players[0].client.data.user_name;
// 			const player2 = room.players[1].client.data.user_name;
// 			this.server.to(room.roomID).emit('names', [player1, player2]);
// 		} else {
// 			client.emit('leftUser', payload.user_name);
// 		}
// 	}

// 	@SubscribeMessage('movement')
// 	handleMovement(client: Socket, payload: string): void {
// 		const roomId = this.clientRoomMap.get(client.id);
// 		if (roomId) {
// 			const room = this.rooms.get(roomId);
// 			if (room) {
// 				if (client.id === room.players[0].client.id) {
// 					this.moveLeftPaddle(room, payload);
// 				} else if (client.id === room.players[1].client.id) {
// 					this.moveRightPaddle(room, payload);
// 				}
// 			}
// 		}
// 	}

// 	moveLeftPaddle(room: Room, payload: string): void {
// 		if (payload === 'ArrowUp') {
// 			room.players[0].paddle = Math.max(0, room.players[0].paddle - 5);
// 		}
// 		if (payload === 'ArrowDown') {
// 			room.players[0].paddle = Math.min(gameHeight - room.leftPaddleSize, room.players[0].paddle + 5);
// 		}
// 	}

// 	moveRightPaddle(room: Room, payload: string): void {
// 		if (payload === 'ArrowUp') {
// 			room.players[1].paddle = Math.max(0, room.players[1].paddle - 5);
// 		}
// 		if (payload === 'ArrowDown') {
// 			room.players[1].paddle = Math.min(gameHeight - room.rightPaddleSize, room.players[1].paddle + 5);
// 		}
// 	}

// 	@SubscribeMessage('start')
// 	handleStart(client: Socket): void {
// 		const roomId = this.clientRoomMap.get(client.id);
// 		if (roomId) {
// 			const room = this.rooms.get(roomId);
// 			if (room && !this.gameInterval) {
// 				this.startGameLoop(room);
// 			}
// 		}
// 	}

// 	@SubscribeMessage('stop')
// 	handleStop(client: Socket): void {
// 		if (this.gameInterval) {
// 			clearInterval(this.gameInterval);
// 			this.gameInterval = undefined;
// 		}
// 	}

// 	@SubscribeMessage('rematch')
// 	handleRematch(client: Socket, payload: boolean): void {
// 		const roomId = this.clientRoomMap.get(client.id);
// 		if (roomId) {
// 			const room = this.rooms.get(roomId);
// 			if (room) {
// 				if (payload === true) {
// 					if (room.rematch === 2) {
// 						room.rematch += 1;
// 						this.resetGame(room);
// 						this.server.to(room.roomID).emit('startSetup', {
// 							x: room.ball.x,
// 							y: room.ball.y,
// 							leftPaddle: room.players[0].paddle,
// 							rightPaddle: room.players[1].paddle,
// 							isPowerUpGame: room.isPowerUpGame,
// 						});
// 						setTimeout(() => {
// 							this.startGameLoop(room);
// 						}, 3000);
// 						room.rematch = 0;
// 					}
// 				}
// 				else if (payload === false)
// 					room.rematch = 0;
// 			}
// 		}
// 	}

// 	resetGame(room: Room) {
// 		room.ball = { x: 200, y: 200, vx: 2, vy: 0 };
// 		room.players[0].paddle = 150;
// 		room.players[1].paddle = 150;
// 		if (room.isPowerUpGame) {
// 			room.hits = 0;
// 			room.showPowerUp = false;
// 			room.extraLifeLeft = false;
// 			room.extraLifeRight = false;
// 			room.leftPaddleSize = paddleHeight;
// 			room.rightPaddleSize = paddleHeight;
// 			room.speedUpHits = 0;
// 			room.powerUpType = this.getRandomNumber(1, 3);
// 			room.powerUpHeight = this.getRandomNumber(0, 270);
// 			room.hitNumber = this.getRandomNumber(2, 6);
// 		}
// 	}

// 	startGameLoop(room: Room) {
// 		this.gameInterval = setInterval(() => this.handleGameUpdate(room), 16);
// 	}

// 	changeBallDirection(paddlePosition: number, paddleSize: number, room: Room) {
// 		const diff = room.ball.y - (paddlePosition + paddleSize / 2);
// 		room.ball.vy = diff / 20;
// 	}

// 	hitCheck(room: Room) {
// 		if (room.isPowerUpGame && room.hits % room.hitNumber === 0) {
// 			room.showPowerUp = true;
// 			this.server.to(room.roomID).emit('showPowerUp', { powerUpType: room.powerUpType, powerUpHeight: room.powerUpHeight });
// 		}
// 	}

// 	handleGameUpdate(room: Room) {
// 		room.ball.x += room.ball.vx;
// 		room.ball.y += room.ball.vy;

// 		if (room.ball.y <= borderWidth || room.ball.y >= gameHeight - borderWidth) {
// 			room.ball.vy = -room.ball.vy;
// 		}

// 		if (room.ball.x <= paddleWidth + ballSize + 4) {
// 			if (room.ball.y >= room.players[0].paddle && room.ball.y <= room.players[0].paddle + room.leftPaddleSize) {
// 				room.ball.vx = Math.abs(room.ball.vx);
// 				this.changeBallDirection(room.players[0].paddle, room.leftPaddleSize, room);
// 				room.hits += 1;
// 				this.hitCheck(room);
// 				if (room.isPowerUpGame && room.powerUpType === PowerUpType.speedUp && room.hits === room.speedUpHits) {
// 					room.ball.vx *= 2;
// 				}
// 			}
// 		} else if (room.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
// 			if (room.ball.y >= room.players[1].paddle && room.ball.y <= room.players[1].paddle + room.rightPaddleSize) {
// 				room.ball.vx = -Math.abs(room.ball.vx);
// 				this.changeBallDirection(room.players[1].paddle, room.rightPaddleSize, room);
// 				room.hits += 1;
// 				this.hitCheck(room);
// 				if (room.isPowerUpGame && room.powerUpType === PowerUpType.speedUp && room.hits === room.speedUpHits) {
// 					room.ball.vx *= 2;
// 				}
// 			}
// 		}

// 		if (room.isPowerUpGame && room.showPowerUp) {
// 			if (room.ball.x >= 185 && room.ball.x <= 215 && room.ball.y >= room.powerUpHeight && room.ball.y <= room.powerUpHeight + 30) {
// 				room.showPowerUp = false;
// 				this.server.to(room.roomID).emit('powerUpHit', room.powerUpType);

// 				if (room.powerUpType === PowerUpType.shield) {
// 					if (room.ball.vx < 0) room.extraLifeRight = true;
// 					else room.extraLifeLeft = true;
// 				}
// 				if (room.powerUpType === PowerUpType.largePaddle) {
// 					if (room.ball.vx < 0) {
// 						room.rightPaddleSize = 150;
// 						this.server.to(room.roomID).emit('enlargePaddle', 2);
// 					} else {
// 						room.leftPaddleSize = 150;
// 						this.server.to(room.roomID).emit('enlargePaddle', 1);
// 					}
// 				}
// 				if (room.powerUpType === PowerUpType.speedUp) {
// 					room.speedUpHits = room.hits + 2;
// 				}
// 				room.powerUpType = this.getRandomNumber(1, 3);
// 				room.hitNumber = this.getRandomNumber(2, 5);
// 				room.powerUpHeight = this.getRandomNumber(0, 270);
// 			}
// 		}

// 		if (room.ball.x <= 0 || room.ball.x >= gameWidth) {
// 			if (room.ball.x <= 0) {
// 				if (room.isPowerUpGame && room.extraLifeLeft) {
// 					room.extraLifeLeft = false;
// 					room.ball.vx = Math.abs(room.ball.vx);
// 				} else {
// 					room.players[1].score += 1;
// 					this.server.to(room.roomID).emit('score', {
// 						left: room.players[0].score,
// 						right: room.players[1].score,
// 					});
// 				}
// 			} else if (room.ball.x >= gameWidth) {
// 				if (room.isPowerUpGame && room.extraLifeRight) {
// 					room.extraLifeRight = false;
// 					room.ball.vx = -Math.abs(room.ball.vx);
// 				} else {
// 					room.players[0].score += 1;
// 					this.server.to(room.roomID).emit('score', {
// 						left: room.players[0].score,
// 						right: room.players[1].score,
// 					});
// 				}
// 			}

// 			if (room.players[0].score == WinScore || room.players[1].score == WinScore) {
// 				if (!room.isPowerUpGame) {
// 					this.insertGameScore(
// 						room.players[0].client.data.intra_id,
// 						room.players[1].client.data.intra_id,
// 						room.players[0].score,
// 						room.players[1].score,
// 					);
// 				}
// 				room.players[0].score = 0;
// 				room.players[1].score = 0;
// 				this.server.to(room.roomID).emit('gameover');
// 				this.resetGame(room);
// 			}
// 		}

// 		this.server.to(room.roomID).emit('gameUpdate', {
// 			x: room.ball.x,
// 			y: room.ball.y,
// 			leftPaddle: room.players[0].paddle,
// 			rightPaddle: room.players[1].paddle,
// 		});
// 	}

// 	db: ReturnType<typeof createDrizzleClient>;
// 	constructor() {
// 		if (!process.env.DATABASE_URL_LOCAL) {
// 			throw Error('Env DATABASE_URL_LOCAL is undefined');
// 		}

// 		this.db = createDrizzleClient(createQueryClient(process.env.DATABASE_URL));
// 	}

// 	async insertGameScore(
// 		player1: number,
// 		player2: number,
// 		score1: number,
// 		score2: number,
// 	): Promise<void> {
// 		try {
// 			await this.db.insert(games).values({
// 				player1_id: player1,
// 				player2_id: player2,
// 				player1_score: score1,
// 				player2_score: score2,
// 			});

// 			if (score1 > score2) {
// 				const swap = player1;
// 				player1 = player2;
// 				player2 = swap;
// 			}
// 			await this.db
// 				.update(users)
// 				.set({
// 					wins: sql`${users.wins} + 1`,
// 				})
// 				.where(eq(users.intra_user_id, player1));
// 			await this.db
// 				.update(users)
// 				.set({
// 					losses: sql`${users.losses} + 1`,
// 				})
// 				.where(eq(users.intra_user_id, player2));

// 			console.log('Game score inserted');
// 		} catch (error) {
// 			console.error('Error inserting game score:', error);
// 		}
// 	}
// }
