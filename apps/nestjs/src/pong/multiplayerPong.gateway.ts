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
import {
  users,
  messages,
  groupChats,
  createQueryClient,
  createDrizzleClient,
  games,
} from '@repo/db';
import type { User } from '@repo/db';
import { eq, or, sql } from 'drizzle-orm';

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

interface Room {
  roomID: string;
  players: Player[];
  ball: Ball;
}

interface Player {
  client: Socket | null;
  paddle: number;
  score: number;
}

@WebSocketGateway({
  cors: { origin: 'http://localhost:2424' },
  namespace: 'multiplayer',
  credentials: true,
  allowEIO3: true,
})
export class MultiplayerPongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('MultiplayerPongGateway');
  private gameInterval: NodeJS.Timeout;
  private clients: Socket[] = [];
  private roomIdCounter = 1;
  private rooms: Map<string, Room> = new Map(); // Maps room ID to Room object
  private clientRoomMap: Map<string, string> = new Map(); // Maps client ID to room ID
  // private clientPlayerMap: Map<string, Player> = new Map(); // Maps client ID to player object

  private createPlayer(client: Socket | null): Player {
    return { client: client, paddle: 150, score: 0 };
  }
  private createRoom(roomID: string, players: Player[], ball: Ball): Room {
    return { roomID, players, ball };
  }
  private createBall(): Ball {
    return { x: 200, y: 200, vx: 2, vy: 0 };
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket MultiplayerPongGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} to multiplayer game`);
    for (const [key, value] of this.clientRoomMap.entries()) {
      this.logger.log(`Player: ${key}, room: ${value}`);
    }
    this.clients.push(client);

    if (this.clients.length % 2 === 0) {
      // When the second client connects, create a room for these two clients
      const roomId = `room_${this.roomIdCounter++}`;
      const firstClient = this.clients[this.clients.length - 2]; // Second last client
      const secondClient = client; // Last client

      // Create players and ball
      const leftPlayer = this.createPlayer(firstClient);
      const rightPlayer = this.createPlayer(secondClient);
      const players = [leftPlayer, rightPlayer];
      const ball = this.createBall();
      const room = this.createRoom(roomId, players, ball);

      this.rooms.set(roomId, room);
      this.clientRoomMap.set(firstClient.id, roomId);
      this.clientRoomMap.set(secondClient.id, roomId);

      this.logger.log(
        `Room created: ${roomId} with players ${firstClient.id} and ${secondClient.id}`,
      );

      // Join both clients to the room
      firstClient.join(roomId);
      secondClient.join(roomId);

      // Emit begin state to the room
      this.server.to(roomId).emit('ball', room.ball);
      this.server.to(roomId).emit('leftPaddle', room.players[0].paddle);
      this.server.to(roomId).emit('rightPaddle', room.players[1].paddle);
      this.server.to(roomId).emit('playersReady');
      setTimeout(() => {
        this.startGameLoop(room);
      }, 3000);
    } else {
      // If it's the first client, just notify them to wait for another player
      client.emit('awaitPlayer');
      this.logger.log('client waiting, client length: ' + this.clients.length);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Find the room containing the disconnected client
    let roomIdToDelete: string | null = null;
    let otherClient: Socket | null = null;
    const roomId = this.clientRoomMap.get(client.id);

    for (const [key, value] of this.clientRoomMap.entries()) {
      this.logger.log(`Player: ${key}, room: ${value}`);
    }
    this.logger.log(`Rooms: ${roomId}`);
    this.logger.log(`Room : ${roomId} lost a player with ${client.id} `);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        // writing score to DB
        if (client.id === room.players[0].client.id)
          this.insertGameScore(
            room.players[0].client.data.intra_id,
            room.players[1].client.data.intra_id,
            room.players[0].score,
            5,
          );
        else
          this.insertGameScore(
            room.players[0].client.data.intra_id,
            room.players[1].client.data.intra_id,
            5,
            room.players[1].score,
          );
        this.logger.log(`writing to DB`);
        room.players = room.players.filter(
          (player) => player.client?.id !== client.id,
        );
        roomIdToDelete = roomId;
        // Notify the remaining player that they are waiting for another player
        if (room.players.length > 0) {
          otherClient = room.players[0].client;
          this.logger.log(
            `Room : ${roomId} still has 1 player with id: ${room.players[0].client?.id}`,
          );
          room.players[0].client?.emit('awaitPlayer', 'Awaiting Player');
        }
      }
      // Delete the empty room if needed
      if (roomIdToDelete) {
        if (this.rooms.delete(roomIdToDelete))
          this.logger.log(`Room deleted: ${roomIdToDelete} in rooms array`);
        else
          this.logger.log(`Room NOT deleted: ${roomIdToDelete} in rooms array`);
      }
      // Remove the client from the clients array and clientRoomMap
      this.clients = this.clients.filter((c) => c.id !== client.id);
      if (this.clientRoomMap.delete(client.id))
        this.logger.log(`client deleted: ${client.id} in clientRoomMap`);
      else
        this.logger.log(`client NOT deleted : ${client.id} in clientRoomMap`);
      if (this.clientRoomMap.delete(otherClient.id))
        this.logger.log(`client deleted: ${otherClient.id} in clientRoomMap`);
      else
        this.logger.log(
          `client NOT deleted: ${otherClient.id} in clientRoomMap`,
        );
      // optionally decrease the room counter
    }
    this.clients = this.clients.filter((c) => c.id !== client.id);
  }

  @SubscribeMessage('registerUser')
  handleRegistration(
    client: Socket,
    payload: { intra_id: number; user_name: string },
  ): void {
    this.logger.log(`Client id: ${client.id}`);
    this.logger.log(`intra ID: ${payload.intra_id}`);
    this.logger.log(`User Name: ${payload.user_name}`);

    // Optionally, store these values in the client object for future reference
    client.data.intra_id = payload.intra_id;
    client.data.user_name = payload.user_name;
    const roomId = this.clientRoomMap.get(client.id);
    this.logger.log(`Room ID: ${roomId}`);
    const room = this.rooms.get(roomId);
    if (room) {
      const player1 = room.players[0].client.data.user_name;
      const player2 = room.players[1].client.data.user_name;
      this.logger.log(
        `client 0: ${room.players[0].client.id}, username: ${player1}`,
      );
      this.logger.log(
        `client 1: ${room.players[1].client.id}, username: ${player2}`,
      );
      console.log('left user: ', player1);
      console.log('right user: ', player2);
      this.server.to(room.roomID).emit('names', [player1, player2]);
    } else {
      client.emit('leftUser', payload.user_name);
      this.logger.log('Room not found');
    }
  }

  @SubscribeMessage('movement')
  handleMovement(client: Socket, payload: string): void {
    this.logger.log(`Client id: ${client.id}`);
    const roomId = this.clientRoomMap.get(client.id);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room) {
        if (client.id === room.players[0].client.id) {
          this.logger.log(`Client payload: ${payload}`);
          this.moveLeftPaddle(room, payload);
        } else if (client.id === room.players[1].client.id) {
          this.logger.log(`Client payload: ${payload}`);
          this.moveRightPaddle(room, payload);
        }
      }
    }
  }

  moveLeftPaddle(room: Room, payload: string): void {
    if (payload === 'ArrowUp') {
      this.logger.log('ArrowUp');
      room.players[0].paddle = Math.max(0, room.players[0].paddle - 5);
      this.server.to(room.roomID).emit('leftPaddle', room.players[0].paddle);
    }
    if (payload === 'ArrowDown') {
      this.logger.log('ArrowDown');
      room.players[0].paddle = Math.min(
        gameHeight - paddleHeight,
        room.players[0].paddle + 5,
      );
      this.server.to(room.roomID).emit('leftPaddle', room.players[0].paddle);
    }
  }

  moveRightPaddle(room: Room, payload: string): void {
    if (payload === 'ArrowUp') {
      this.logger.log('ArrowUp');
      room.players[1].paddle = Math.max(0, room.players[1].paddle - 5);
      this.server.to(room.roomID).emit('rightPaddle', room.players[1].paddle);
    }
    if (payload === 'ArrowDown') {
      this.logger.log('ArrowDown');
      room.players[1].paddle = Math.min(
        gameHeight - paddleHeight,
        room.players[1].paddle + 5,
      );
      this.server.to(room.roomID).emit('rightPaddle', room.players[1].paddle);
    }
  }

  @SubscribeMessage('start')
  handleStart(client: Socket): void {
    const roomId = this.clientRoomMap.get(client.id);
    if (roomId) {
      const room = this.rooms.get(roomId);
      if (room && !this.gameInterval) {
        this.logger.log('Starting game loop in room: ' + room.roomID);
        this.startGameLoop(room);
      }
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

  resetGame = (room: Room) => {
    room.ball = { x: 200, y: 200, vx: 2, vy: 0 };
    room.players[0].paddle = 150;
    room.players[1].paddle = 150;
  };

  startGameLoop(room: Room) {
    this.gameInterval = setInterval(() => this.handleGameUpdate(room), 16);
  }

  changeBallDirection = (paddlePosition: number, room: Room) => {
    const diff = room.ball.y - (paddlePosition + paddleHeight / 2);
    room.ball.vy = diff / 20;
  };

  handleGameUpdate(room: Room) {
    // Update ball position
    room.ball.x += room.ball.vx;
    room.ball.y += room.ball.vy;

    // Ball collision with walls
    if (room.ball.y <= borderWidth || room.ball.y >= gameHeight - borderWidth) {
      room.ball.vy = -room.ball.vy;
    }

    // Ball collision with left paddle
    if (room.ball.x <= paddleWidth + ballSize + 4) {
      if (
        room.ball.y >= room.players[0].paddle &&
        room.ball.y <= room.players[0].paddle + paddleHeight
      ) {
        room.ball.vx = -room.ball.vx;
        this.changeBallDirection(room.players[0].paddle, room);
      }
    }
    // Ball collision with right paddle
    else if (room.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
      if (
        room.ball.y >= room.players[1].paddle &&
        room.ball.y <= room.players[1].paddle + paddleHeight
      ) {
        room.ball.vx = -room.ball.vx;
        this.changeBallDirection(room.players[1].paddle, room);
      }
    }

    // Ball out of bounds
    if (room.ball.x <= 0 || room.ball.x >= gameWidth) {
      if (room.ball.x <= 0) {
        room.players[1].score += 1;
        this.server.to(room.roomID).emit('score', {
          left: room.players[0].score,
          right: room.players[1].score,
        });
      } else if (room.ball.x >= gameWidth) {
        room.players[0].score += 1;
        this.server.to(room.roomID).emit('score', {
          left: room.players[0].score,
          right: room.players[1].score,
        });
      }
      if (
        room.players[0].score == WinScore ||
        room.players[1].score == WinScore
      ) {
        this.insertGameScore(
          room.players[0].client.data.intra_id,
          room.players[1].client.data.intra_id,
          room.players[0].score,
          room.players[1].score,
        );
        this.logger.log(
          `writing to DB: ${room.players[0].score} - ${room.players[1].score}`,
        );
        room.players[0].score = 0;
        room.players[1].score = 0;
        this.server.to(room.roomID).emit('score', {
          left: room.players[0].score,
          right: room.players[1].score,
        });
        this.server.to(room.roomID).emit('gameover');
      }
      this.resetGame(room);
    }

    // Emit updated state to clients
    this.server.to(room.roomID).emit('ball', room.ball);
    this.server.to(room.roomID).emit('rightPaddle', room.players[1].paddle);
    this.server.to(room.roomID).emit('leftPaddle', room.players[0].paddle);
  }

  db: ReturnType<typeof createDrizzleClient>;
  constructor() {
    if (!process.env.DATABASE_URL_LOCAL) {
      throw Error('Env DATABASE_URL_LOCAL is undefined');
    }

    this.db = createDrizzleClient(createQueryClient(process.env.DATABASE_URL));
  }
  async insertGameScore(
    player1: number,
    player2: number,
    score1: number,
    score2: number,
  ): Promise<void> {
    try {
      await this.db.insert(games).values({
        player1_id: player1,
        player2_id: player2,
        player1_score: score1,
        player2_score: score2,
      });

      if (score1 > score2) {
        await this.db
          .update(users)
          .set({
            wins: sql`${users.wins} + 1`,
          })
          .where(eq(users.intra_user_id, player1));
        await this.db
          .update(users)
          .set({
            losses: sql`${users.losses} + 1`,
          })
          .where(eq(users.intra_user_id, player2));
      } else {
        await this.db
          .update(users)
          .set({
            wins: sql`${users.wins} + 1`,
          })
          .where(or(eq(users.intra_user_id, player2)));
        await this.db
          .update(users)
          .set({
            losses: sql`${users.losses} + 1`,
          })
          .where(or(eq(users.intra_user_id, player1)));
      }

      console.log('Game score inserted');
    } catch (error) {
      console.error('Error inserting game score:', error);
    }
  }
}
