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
  const WinScore = 5;
  
  interface Ball {
	x: number;
	y: number;
	vx: number;
	vy: number;
  }
  
  interface Player {
	client: Socket | null;
	paddle: number; // Current paddle position
	movementDirection: 'up' | 'down' | null; // Current movement direction
	movementInterval: NodeJS.Timeout | null; // Interval ID for paddle movement
  }
  
  enum PowerUpType {
	shield = 1,
	largePaddle = 2,
	speedUp = 3,
  }
  
  interface GameState {
	ball: {
	  x: number,
	  y: number,
	},
	leftPaddle: number,
	rightPaddle: number,
	score: {
	  left: number,
	  right: number,
	},
  }
  
  interface GameInstance {
	id: string;
	player: Player;
	leftPaddle: number;
	ball: Ball;
	score: { left: number, right: number };
	gameInterval: NodeJS.Timeout | null;
	hits: number;
	hitNumber: number;
	showPowerUp: boolean;
	powerUpType: number;
	powerUpHeight: number;
	extraLifeRight: boolean;
	extraLifeLeft: boolean;
	rightPaddleSize: number;
	leftPaddleSize: number;
	speedUpHits: number;
	gameActive: boolean; // New flag to track if game is currently active
  }
  
  @WebSocketGateway({ cors: { origin: `http://${process.env.HOST_NAME}:2424` }, namespace: 'power-up', credentials: true, allowEIO3: true })
  export class PowerUpPongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;
	private logger: Logger = new Logger('PowerUpPongGateway');
	
	// Store multiple game instances by client ID
	private games: Map<string, GameInstance> = new Map();
  
	// Function to generate a random number between min and max
	private getRandomNumber(min: number = 10, max: number = 20): number {
	  return Math.floor(Math.random() * (max - min + 1)) + min;
	}
  
	// Create a new game instance for a client
	private createGameInstance(client: Socket): GameInstance {
	  return {
		id: client.id,
		player: { client, paddle: 150, movementDirection: null, movementInterval: null },
		leftPaddle: 150,
		ball: { x: 200, y: 200, vx: 2, vy: 0 },
		score: { left: 0, right: 0 },
		gameInterval: null,
		hits: 0,
		hitNumber: this.getRandomNumber(2, 6),
		showPowerUp: false,
		powerUpType: this.getRandomNumber(1, 3),
		powerUpHeight: this.getRandomNumber(0, 270),
		extraLifeRight: false,
		extraLifeLeft: false,
		rightPaddleSize: 100,
		leftPaddleSize: 100,
		speedUpHits: 0,
		gameActive: false // Game starts inactive until user clicks start
	  };
	}
  
	afterInit(server: Server) {
	  this.logger.log('WebSocket PowerUpPongGateway initialized');
	}
  
	handleConnection(client: Socket) {
	  this.logger.log(`Client connected: ${client.id} to power up game`);
	  
	  // Create a new game instance for this client
	  const gameInstance = this.createGameInstance(client);
	  this.games.set(client.id, gameInstance);
	  
	  // Send initial game state to the client
	  client.emit('startSetup', this.getGameState(gameInstance));
	}
  
	handleDisconnect(client: Socket) {
	  this.logger.log(`Client disconnected: ${client.id}`);
	  
	  const game = this.games.get(client.id);
	  if (game) {
		// Clean up game resources
		if (game.gameInterval) {
		  clearInterval(game.gameInterval);
		}
		
		// Clean up paddle movement interval if exists
		if (game.player.movementInterval) {
		  clearInterval(game.player.movementInterval);
		}
		
		// Remove the game instance
		this.games.delete(client.id);
	  }
	}
  
	@SubscribeMessage('start')
	handleStart(client: Socket): void {
	  const game = this.games.get(client.id);
	  if (!game) return;
	  
	  // If game is already running, ignore
	  if (game.gameActive && game.gameInterval) {
		return;
	  }
	  
	  // Set game as active
	  game.gameActive = true;
	  this.logger.log(`Starting game loop for client: ${client.id}`);
	  this.startGameLoop(game);
	}
  
	@SubscribeMessage('key_event')
	handleKeyEvent(client: Socket, payload: { key: string; state: 'down' | 'up' }): void {
	  const game = this.games.get(client.id);
	  if (!game || !game.gameActive) return; // Ignore key events if game is not active
  
	  if (payload.state === 'down') {
		if (payload.key === 'ArrowUp') {
		  game.player.movementDirection = 'up';
		} else if (payload.key === 'ArrowDown') {
		  game.player.movementDirection = 'down';
		}
		this.startPaddleMovement(game);
	  } else if (payload.state === 'up') {
		if (payload.key === 'ArrowUp' && game.player.movementDirection === 'up') {
		  game.player.movementDirection = null;
		} else if (payload.key === 'ArrowDown' && game.player.movementDirection === 'down') {
		  game.player.movementDirection = null;
		}
		if (!game.player.movementDirection) {
		  this.stopPaddleMovement(game);
		}
	  }
	}
  
	private startPaddleMovement(game: GameInstance): void {
	  if (!game.player.movementInterval) {
		game.player.movementInterval = setInterval(() => {
		  if (game.player.movementDirection === 'up') {
			game.player.paddle = Math.max(0, game.player.paddle - 3);
		  } else if (game.player.movementDirection === 'down') {
			game.player.paddle = Math.min(gameHeight - game.rightPaddleSize, game.player.paddle + 3);
		  }
		  if (game.player.client && game.player.client.connected) {
			game.player.client.emit(`right`, game.player.paddle);
		  }
		}, 1000 / 60); // 60 updates per second
	  }
	}
  
	private stopPaddleMovement(game: GameInstance): void {
	  if (game.player.movementInterval) {
		clearInterval(game.player.movementInterval);
		game.player.movementInterval = null;
	  }
	}
  
	resetGame = (game: GameInstance) => {
	  // Stop the game loop if it's running
	  if (game.gameInterval) {
		clearInterval(game.gameInterval);
		game.gameInterval = null;
	  }
	  
	  // Reset game state
	  game.ball.vx = 2;
	  game.ball.vy = 0;
	  game.ball.x = 200;
	  game.ball.y = 200;
	  game.player.paddle = 150;
	  game.leftPaddle = 150;
	  game.hits = 0;
	  game.showPowerUp = false;
	  game.extraLifeRight = false;
	  game.extraLifeLeft = false;
	  game.rightPaddleSize = 100;
	  game.leftPaddleSize = 100;
	  game.speedUpHits = 0;
	  game.powerUpType = this.getRandomNumber(1, 3);
	  game.hitNumber = this.getRandomNumber(2, 6);
	  game.powerUpHeight = this.getRandomNumber(0, 270);
	  
	  // Mark game as inactive - will wait for user to click start
	  game.gameActive = false;
	  
	  if (game.player.client && game.player.client.connected) {
		game.player.client.emit('startSetup', this.getGameState(game));
	  }
	};
  
	startGameLoop(game: GameInstance) {
	  game.powerUpType = this.getRandomNumber(1, 3);
	  game.hitNumber = this.getRandomNumber(2, 6);
	  game.powerUpHeight = this.getRandomNumber(0, 270);
	  game.gameInterval = setInterval(() => this.handleGameUpdate(game), 16);
	}
  
	changeBallDirection = (paddlePosition: number, paddleSize: number, game: GameInstance) => {
	  const diff = game.ball.y - (paddlePosition + paddleSize / 2);
	  game.ball.vy = diff / 20;
	};
  
	hitCheck = (game: GameInstance) => {
	  if (game.hits % game.hitNumber === 0) {
		game.showPowerUp = true;
		if (game.player.client && game.player.client.connected) {
		  game.player.client.emit('showPowerUp', { 
			powerUpType: game.powerUpType, 
			powerUpHeight: game.powerUpHeight 
		  });
		}
	  }
	}
	
	getGameState = (game: GameInstance): GameState => {
	  return {
		ball: {
		  x: game.ball.x,
		  y: game.ball.y,
		},
		leftPaddle: game.leftPaddle,
		rightPaddle: game.player.paddle,
		score: {
		  left: game.score.left,
		  right: game.score.right,
		}
	  };
	}
  
	handleGameUpdate(game: GameInstance) {
	  const client = game.player.client;
	  if (!client || !client.connected) {
		// Clean up game if client is disconnected
		if (game.gameInterval) {
		  clearInterval(game.gameInterval);
		  game.gameInterval = null;
		}
		return;
	  }
  
	  // Update ball position
	  game.ball.x += game.ball.vx;
	  game.ball.y += game.ball.vy;
  
	  // Ball collision with walls
	  if (game.ball.y <= borderWidth || game.ball.y >= gameHeight - borderWidth) {
		game.ball.vy = -game.ball.vy;
	  }
  
	  // Ball collision with left paddle
	  if (game.ball.x <= paddleWidth + ballSize + 4) {
		if (game.ball.y >= game.leftPaddle && game.ball.y <= game.leftPaddle + game.leftPaddleSize) {
		  if (game.ball.vx < 0)
			game.ball.vx = -game.ball.vx;
		  this.changeBallDirection(game.leftPaddle, game.leftPaddleSize, game);
		  game.hits += 1;
		  this.hitCheck(game);
		  if (game.hits === game.speedUpHits) {
			game.ball.vx = game.ball.vx * 2;
			this.logger.log(`Client ${client.id}: Speeding up!!!!`);
		  }
		}
	  }
	  // Ball collision with right paddle
	  else if (game.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
		if (game.ball.y >= game.player.paddle && game.ball.y <= game.player.paddle + game.rightPaddleSize) {
		  if (game.ball.vx > 0)
			game.ball.vx = -game.ball.vx;
		  this.changeBallDirection(game.player.paddle, game.rightPaddleSize, game);
		  game.hits += 1;
		  this.hitCheck(game);
		  if (game.hits === game.speedUpHits) {
			game.ball.vx = game.ball.vx * 2;
			this.logger.log(`Client ${client.id}: Speeding up!!!!`);
		  }
		}
	  }
  
	  if (game.showPowerUp) {
		if (game.ball.x >= 185 && game.ball.x <= 215)
		  if (game.ball.y >= game.powerUpHeight && game.ball.y <= (game.powerUpHeight + 30)) {
			game.showPowerUp = false;
			game.powerUpHeight = 0;
			client.emit('powerUpHit', game.powerUpType);
			
			this.logger.log(`Client ${client.id}: Power up hit ${game.powerUpType}`);
			
			if (game.powerUpType === PowerUpType.shield) {
			  this.logger.log(`Client ${client.id}: Shield hit, setting extra life`);
			  if (game.ball.vx < 0)
				game.extraLifeRight = true;
			  else
				game.extraLifeLeft = true;
			}
			
			if (game.powerUpType === PowerUpType.largePaddle) {
			  this.logger.log(`Client ${client.id}: Large paddle hit`);
			  if (game.ball.vx < 0) {
				game.rightPaddleSize = 150;
				client.emit('enlargePaddle', 2);
			  }
			  else {
				game.leftPaddleSize = 150;
				client.emit('enlargePaddle', 1);
			  }
			}
			
			if (game.powerUpType === PowerUpType.speedUp) {
			  game.speedUpHits = game.hits + 2;
			  this.logger.log(`Client ${client.id}: Speed up hit set at ${game.speedUpHits}`);
			}
			
			game.powerUpType = this.getRandomNumber(1, 3);
			game.hitNumber = this.getRandomNumber(2, 5);
			game.powerUpHeight = this.getRandomNumber(0, 270);
		  }
	  }
  
	  // AI for left paddle
	  if (game.ball.y > (game.leftPaddle + game.leftPaddleSize)) {
		game.leftPaddle = Math.min(gameHeight - game.leftPaddleSize, game.leftPaddle + 2);
	  } else if (game.ball.y < game.leftPaddle) {
		game.leftPaddle = Math.max(0, game.leftPaddle - 2);
	  }
  
	  // Ball out of bounds
	  if (game.ball.x <= 0 || game.ball.x >= gameWidth) {
		if (game.ball.x <= 0) {
		  if (game.extraLifeLeft) {
			game.extraLifeLeft = false;
			game.ball.vx = -game.ball.vx;
			this.logger.log(`Client ${client.id}: Extra life used`);
			return;
		  }
		  else {
			game.score.right += 1;
			client.emit('score', { left: game.score.left, right: game.score.right });
		  }
		}
		else if (game.ball.x >= gameWidth) {
		  if (game.extraLifeRight) {
			game.extraLifeRight = false;
			game.ball.vx = -game.ball.vx;
			this.logger.log(`Client ${client.id}: Extra life used`);
			return;
		  }
		  else {
			game.score.left += 1;
			client.emit('score', { left: game.score.left, right: game.score.right });
		  }
		}
		
		if (game.score.left == WinScore || game.score.right == WinScore) {
		  // Game over - reset scores and wait for user to start again
		  game.score = { left: 0, right: 0 };
		  client.emit('score', { left: 0, right: 0 });
		  client.emit('gameover', 'Game Over - Click Start to play again');
		  
		  // Reset game and stop game loop
		  this.resetGame(game);
		} else {
		  // Just a point scored, not game over
		  client.emit('reset');
		  
		  // Reset ball position but keep the game going
		  game.ball.vx = 2;
		  game.ball.vy = 0;
		  game.ball.x = 200;
		  game.ball.y = 200;
		  game.player.paddle = 150;
		  game.leftPaddle = 150;
		}
	  }
  
	  // Emit updated state to client
	  client.emit('gameUpdate', this.getGameState(game));
	}
  }