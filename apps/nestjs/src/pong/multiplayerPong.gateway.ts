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
  createQueryClient,
  createDrizzleClient,
  games,
  friends,
} from '@repo/db';
import { and, or, eq, sql } from 'drizzle-orm';

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
  rematch: number;
}

// interface Player {
//   client: Socket | null;
//   paddle: number;
//   score: number;
// }

interface Player {
  client: Socket | null;
  paddle: number; // Current paddle position
  movementDirection: 'up' | 'down' | null; // Current movement direction
  movementInterval: NodeJS.Timeout | null; // Interval ID for paddle movement
  score: number;
}

@WebSocketGateway({
  cors: { origin: `http://${process.env.HOST_NAME}:2424` },
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
  private privateRooms: Map<string, Room> = new Map(); // Maps room ID to Room object
  // private clientPlayerMap: Map<string, Player> = new Map(); // Maps client ID to player object

  private createPlayer(client: Socket | null): Player {
    return { client: client, paddle: 150, movementDirection: null, movementInterval: null, score: 0 };
  }
  private createRoom(roomID: string, players: Player[], ball: Ball): Room {
    return { roomID, players, ball, rematch: 0 };
  }
  private createBall(): Ball {
    return { x: 200, y: 200, vx: 2, vy: 0 };
  }

  afterInit() {
    this.logger.log('WebSocket MultiplayerPongGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id} to multiplayer game`);
    for (const [key, value] of this.clientRoomMap.entries()) {
      this.logger.log(`Player: ${key}, room: ${value}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.handleStop();
    this.logger.log(`Client disconnected: ${client.id}`);

    // Find the room containing the disconnected client (public or private)
    const roomId = this.clientRoomMap.get(client.id);
    const privateRoomId = `room_${client.data.intra_id}`;

    if (roomId) {
      // Handle disconnect from a public room
      const room = this.rooms.get(roomId);
      if (room) {
        this.handleRoomDisconnect(client, room, roomId);
      }
    } else if (this.privateRooms.has(privateRoomId)) {
      // Handle disconnect from a private room
      const privateRoom = this.privateRooms.get(privateRoomId);
      if (privateRoom) {
        this.handleRoomDisconnect(client, privateRoom, privateRoomId, true);
      }
    }

    // Remove the client from the global client list
    this.clients = this.clients.filter((c) => c.id !== client.id);
  }

  private handleRoomDisconnect(
    client: Socket,
    room: any,
    roomId: string,
    isPrivateRoom = false,
  ) {
    // Writing score to DB if game started
    if (client.id === room.players[0]?.client?.id) {
      this.insertGameScore(
        room.players[0].client.data.intra_id,
        room.players[1].client.data.intra_id,
        room.players[0].score,
        5,
      );
    } else {
      this.insertGameScore(
        room.players[0].client.data.intra_id,
        room.players[1].client.data.intra_id,
        5,
        room.players[1].score,
      );
    }

    this.logger.log(`Writing to DB for room: ${roomId}`);

    // Remove disconnected client from the room
    room.players = room.players.filter(
      (player) => player.client?.id !== client.id,
    );

    // Notify the remaining player
    const otherClient = room.players[0].client;
    if (room.players.length > 0) {
      this.logger.log(`Opponent left: ${client.id}`);
      otherClient?.emit('opponent_left', 'Your opponent has left the game');
    }

    // Delete the room
    if (isPrivateRoom) {
      this.privateRooms.delete(roomId);
    } else {
      this.rooms.delete(roomId);
    }
    this.logger.log(`Room deleted: ${roomId}`);

    // Remove the client from room mappings
    this.clientRoomMap.delete(client.id);
    this.clientRoomMap.delete(otherClient.id);

    // Remove the client from the global client list
    this.clients = this.clients.filter((c) => c.id !== otherClient.id);
    // if (room.players.length > 0) {
    //   this.clientRoomMap.delete(room.players[0].client?.id);
    // }
  }

  @SubscribeMessage('declineGameInvite')
  handleDeclineGameInvite(client: Socket, opp_id: number): void {
    this.logger.log(`Client declined: ${client.id}`);
    const roomId = `room_${opp_id}`;
    const room = this.privateRooms.get(roomId);
    if (room) {
      this.logger.log(`Emit declined: ${opp_id}`);
      room.players[0].client.emit(
        'opponent_declined',
        'Your opponent has declined the game',
      );
      this.privateRooms.delete(roomId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);

    // Find the room containing the disconnected client (public or private)
    const privateRoomId = `room_${client.data.intra_id}`;

    if (this.privateRooms.has(privateRoomId)) {
      // Handle disconnect from a private room
      const privateRoom = this.privateRooms.get(privateRoomId);
      if (privateRoom) {
        this.handleRoomDisconnect(client, privateRoom, privateRoomId, true);
      }
    }

    // Remove the client from the global client list
    this.clients = this.clients.filter((c) => c.id !== client.id);
    room.players = room.players.filter(
      (player) => player.client?.id !== client.id,
    );
    this.privateRooms.delete(roomId);
    this.logger.log(`Room deleted: ${roomId}`);

    // Remove the client from room mappings
    this.clientRoomMap.delete(client.id);
  }

  @SubscribeMessage('registerUsers')
  handleRegistration(
    client: Socket,
    payload: {
      intra_id: number;
      user_name: string;
      opp_id: number;
      opp_nn: string;
    },
  ): void {
    const clientExists = this.clients.some(
      (existingClient) => existingClient.id === client.id,
    );
    if (clientExists) {
      this.logger.log('Client already exists');
      return;
    }
    this.clients.push(client);
    this.logger.log(`opp_id = ${payload.opp_id}`);
    if (payload.opp_id == 0) {
      this.randomMatch(client);
      this.fillRoomdata(client, payload.intra_id, payload.user_name);
    } else {
      this.privateMatch(
        client,
        payload.intra_id,
        payload.user_name,
        payload.opp_id,
        payload.opp_nn,
      );
    }
  }

  async disableInviteGame(intra_id: number, opp_id: number): Promise<void> {
    try {
      await this.db
        .update(friends)
        .set({ invite_game: false })
        .where(
          or(
            and(
              eq(friends.user_id_send, intra_id),
              eq(friends.user_id_receive, opp_id),
            ),
            and(
              eq(friends.user_id_send, opp_id),
              eq(friends.user_id_receive, intra_id),
            ),
          ),
        );
    } catch (error) {
      console.error('Error updating invite game:', error);
    }
  }

  privateMatch(
    client: Socket,
    intra_id: number,
    user_name: string,
    opp_id: number,
    opp_nn: string,
  ): void {
    if (this.privateRooms.has(`room_${intra_id}`)) {
      const room = this.privateRooms.get(`room_${intra_id}`);
      const secondClient = client;
      const rightPlayer = this.createPlayer(secondClient);
      room.players[1] = rightPlayer;
      this.logger.log(
        `Room joined: room_${intra_id} with players ${user_name} and ${opp_nn}`,
      );
      secondClient.join(`room_${intra_id}`);
      this.clientRoomMap.set(secondClient.id, `room_${intra_id}`);
      this.fillRoomdata(client, intra_id, user_name);
      this.server.to(`room_${intra_id}`).emit('startSetup', {
        x: room.ball.x,
        y: room.ball.y,
        leftPaddle: room.players[0].paddle,
        rightPaddle: room.players[1].paddle,
      });
      this.disableInviteGame(intra_id, opp_id);
      setTimeout(() => {
        this.startGameLoop(room);
      }, 3000);
    } else {
      const roomId = `room_${opp_id}`;
      const firstClient = client;
      const leftPlayer = this.createPlayer(firstClient);
      const players = [leftPlayer, null];
      const ball = this.createBall();
      const room = this.createRoom(roomId, players, ball);
      this.privateRooms.set(roomId, room);
      this.clientRoomMap.set(firstClient.id, roomId);
      this.logger.log(
        `private room created: ${roomId} with players ${user_name} and ${opp_nn}`,
      );
      firstClient.join(roomId);
      client.emit('awaitPlayer');
    }
  }

  randomMatch(client: Socket): void {
    if (this.clients.length > 0 && this.clients.length % 2 === 0) {
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
      this.server.to(roomId).emit('startSetup', {
        x: room.ball.x,
        y: room.ball.y,
        leftPaddle: room.players[0].paddle,
        rightPaddle: room.players[1].paddle,
      });
      // this.server.to(roomId).emit('playersReady');
      setTimeout(() => {
        this.startGameLoop(room);
      }, 3000);
    } else {
      // If it's the first client, just notify them to wait for another player
      client.emit('awaitPlayer');
      this.logger.log('client waiting, client length: ' + this.clients.length);
    }
  }

  fillRoomdata(client: Socket, intra_id: number, user_name: string): void {
    this.logger.log(`Client id: ${client.id}`);
    this.logger.log(`intra ID: ${intra_id}`);
    this.logger.log(`User Name: ${user_name}`);

    // Optionally, store these values in the client object for future reference
    client.data.intra_id = intra_id;
    client.data.user_name = user_name;
    const roomId = this.clientRoomMap.get(client.id);
    this.logger.log(`Room ID: ${roomId}`);
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.privateRooms.get(`room_${intra_id}`);
    }
    if (room) {
      const player1 = room.players[0].client.data.user_name;
      const player2 = room.players[1].client.data.user_name;
      this.logger.log(
        `client 0: ${room.players[0].client.id}, username: ${player1}`,
      );
      this.logger.log(
        `client 1: ${room.players[1].client.id}, username: ${player2}`,
      );
      this.logger.log('left user: ', player1);
      this.logger.log('right user: ', player2);
      this.server.to(room.roomID).emit('names', [player1, player2]);
    } else {
      client.emit('leftUser', user_name);
      this.logger.log('Room not found');
    }
  }

  @SubscribeMessage('key_event')
  handleKeyEvent(client: Socket, payload: { key: string; state: 'down' | 'up' }): void {
    this.logger.log(`Client id: ${client.id}, Key: ${payload.key}, State: ${payload.state}`);
    const roomId = this.clientRoomMap.get(client.id);
    this.logger.log(`room id: ${roomId}`);
    if (roomId) {
      let room = this.rooms.get(roomId);
      if (!room) {
        room = this.privateRooms.get(roomId);
      }
      if (room) {
        if (client.id === room.players[0].client.id) {
          this.handleLeftPaddleKey(room, payload);
        } else if (client.id === room.players[1].client.id) {
          this.handleRightPaddleKey(room, payload);
        }
      }
    }
  }

  private handleLeftPaddleKey(room: Room, payload: { key: string; state: 'down' | 'up' }): void {
    const player = room.players[0];

    if (payload.state === 'down') {
      if (payload.key === 'ArrowUp') {
        player.movementDirection = 'up';
      } else if (payload.key === 'ArrowDown') {
        player.movementDirection = 'down';
      }
      this.startPaddleMovement(room, player, 'left');
    } else if (payload.state === 'up') {
      if (payload.key === 'ArrowUp' && player.movementDirection === 'up') {
        player.movementDirection = null;
      } else if (payload.key === 'ArrowDown' && player.movementDirection === 'down') {
        player.movementDirection = null;
      }
      if (!player.movementDirection) {
        this.stopPaddleMovement(room, player, 'left');
      }
    }
  }

  private handleRightPaddleKey(room: Room, payload: { key: string; state: 'down' | 'up' }): void {
    const player = room.players[1];

    if (payload.state === 'down') {
      if (payload.key === 'ArrowUp') {
        player.movementDirection = 'up';
      } else if (payload.key === 'ArrowDown') {
        player.movementDirection = 'down';
      }
      this.startPaddleMovement(room, player, 'right');
    } else if (payload.state === 'up') {
      if (payload.key === 'ArrowUp' && player.movementDirection === 'up') {
        player.movementDirection = null;
      } else if (payload.key === 'ArrowDown' && player.movementDirection === 'down') {
        player.movementDirection = null;
      }
      if (!player.movementDirection) {
        this.stopPaddleMovement(room, player, 'right');
      }
    }
  }

  private startPaddleMovement(room: Room, player: Player, side: 'left' | 'right'): void {
    if (!player.movementInterval) {
      player.movementInterval = setInterval(() => {
        if (player.movementDirection === 'up') {
          player.paddle = Math.max(0, player.paddle - 2);
        } else if (player.movementDirection === 'down') {
          player.paddle = Math.min(gameHeight - paddleHeight, player.paddle + 2);
        }
        this.server.to(room.roomID).emit(`${side}Paddle`, player.paddle);
      }, 1000 / 60); // 60 updates per second
    }
  }

  private stopPaddleMovement(room: Room, player: Player, side: 'left' | 'right'): void {
    if (player.movementInterval) {
      clearInterval(player.movementInterval);
      player.movementInterval = null;
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
  handleStop(): void {
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
        if (room.ball.vx < 0) room.ball.vx = -room.ball.vx;
        this.changeBallDirection(room.players[0].paddle, room);
      }
    }
    // Ball collision with right paddle
    else if (room.ball.x >= gameWidth - (paddleWidth + ballSize) - 4) {
      if (
        room.ball.y >= room.players[1].paddle &&
        room.ball.y <= room.players[1].paddle + paddleHeight
      ) {
        if (room.ball.vx > 0) room.ball.vx = -room.ball.vx;
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
    if (room.players.length > 1)
      this.server.to(room.roomID).emit('gameUpdate', {
        x: room.ball.x,
        y: room.ball.y,
        leftPaddle: room.players[0].paddle,
        rightPaddle: room.players[1].paddle,
      });
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

      if (score1 < score2) {
        const swap = player1;
        player1 = player2;
        player2 = swap;
      }
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

      console.log('Game score inserted');
    } catch (error) {
      console.error('Error inserting game score:', error);
    }
  }
}
