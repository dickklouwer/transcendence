import {
  Controller,
  Get,
  Headers,
  UseGuards,
  Query,
  Post,
  Body,
  Res,
  Delete,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserChats } from './auth/auth.service';
import type { User, ExternalUser } from '@repo/db';
import { DbService } from './db/db.service';
import { Response } from 'express';

@Controller('api')
export class AppController {
  constructor(
    private appService: AppService,
    private dbservice: DbService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(
    @Headers('authorization') token: string,
    @Res() res: Response,
  ): Promise<User> {
    const user: User | null = await this.dbservice.getUserFromDataBase(
      token.split(' ')[1],
    );
    if (!user) {
      res.status(404).send("User doesn't exist");
      return;
    }
    res.status(200).send(user);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('checkNickname')
  async checkNickname(@Query('nickname') nickname: string): Promise<boolean> {
    const isUnique = await this.dbservice.CheckNicknameIsUnque(nickname);

    return isUnique;
  }

  @UseGuards(JwtAuthGuard)
  @Post('setNickname')
  async setNickname(
    @Headers('authorization') token: string,
    @Body('nickname') nickname: string,
    @Res() res: Response,
  ) {
    const isUnique = await this.dbservice.CheckNicknameIsUnque(nickname);

    if (!isUnique) {
      res.status(422).send(`Nickname is not unique`);
      return;
    }
    const response = await this.dbservice.setUserNickname(
      token.split(' ')[1],
      nickname,
    );
    res.status(200).send(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUser(
    @Headers('authorization') intra_user_id: number,
    @Res() res: Response,
  ): Promise<User> {
    const user = await this.dbservice.getAnyUserFromDataBase(intra_user_id);

    if (!user) {
      res.status(404).send("User doesn't exist");
    }

    res.status(200).send(user);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('chats')
  async getChats(
    @Headers('authorization') token: string,
  ): Promise<UserChats[]> {
    const userChats = await this.dbservice.getChatsFromDataBase(
      token.split(' ')[1],
    );

    if (!userChats) throw Error('Failed to fetch user');

    return userChats;
  }

  @Post('createMockData')
  async mockData(): Promise<boolean> {
    const hardcoddedIntraId = 77718;
    const response = await this.dbservice.mockData(hardcoddedIntraId);
    return response;
  }

  // not working yet
  // @Post('createMockData')
  // async mockData(token: string): Promise<boolean> {
  //   const user = await this.dbservice.getUserFromDataBase(token.split(' ')[1]);
  //   const response = await this.dbservice.mockData(user.intra_user_id);
  //   return response;
  // }
  @UseGuards(JwtAuthGuard)
  @Get('getExternalUsers')
  async searchUser(
    @Headers('authorization') token: string,
    @Res() res: Response,
  ): Promise<ExternalUser[]> {
    const users = await this.dbservice.getAllExternalUsers(token.split(' ')[1]);

    if (!users) {
      res.status(404).send('No users found');
      return;
    }
    res.status(200).send(users);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sendFriendRequest')
  async sendFriendRequest(
    @Headers('authorization') token: string,
    @Body('user_intra_id') user_intra_id: number,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.sendFriendRequest(
      token.split(' ')[1],
      user_intra_id,
    );

    if (!response) {
      res.status(422).send('Failed to send friend request');
      return;
    }

    res.status(200).send(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getFriendsNotApproved')
  async getFriends(
    @Headers('authorization') token: string,
    @Res() res: Response,
  ) {
    const friends = await this.dbservice.getFriendsNotApprovedFromDataBase(
      token.split(' ')[1],
    );

    if (!friends) {
      res.status(404).send('No friends found');
      return;
    }

    res.status(200).send(friends);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getApprovedFriends')
  async getApprovedFriends(
    @Headers('authorization') token: string,
    @Res() res: Response,
  ) {
    const friends = await this.dbservice.getFriendsApprovedFromDataBase(
      token.split(' ')[1],
    );

    if (!friends) {
      res.status(404).send('No friends found');
      return;
    }

    res.status(200).send(friends);
  }

  @UseGuards(JwtAuthGuard)
  @Get('incomingFriendRequests')
  async getIncomingFriendRequests(
    @Headers('authorization') token: string,
    @Res() res: Response,
  ) {
    const requests = await this.dbservice.getIncomingFriendRequests(
      token.split(' ')[1],
    );

    if (!requests) {
      res.status(404).send('No requests found');
      return;
    }

    res.status(200).send(requests);
  }

  @UseGuards(JwtAuthGuard)
  @Post('acceptFriendRequest')
  async acceptFriendRequest(
    @Headers('authorization') token: string,
    @Body('friend_id') friend_id: number,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.acceptFriendRequest(
      token.split(' ')[1],
      friend_id,
    );

    if (!response) {
      res.status(422).send('Failed to accept friend request');
      return;
    }

    res.status(200).send(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('declineFriendRequest')
  async declineFriendRequest(
    @Headers('authorization') token: string,
    @Query('friend_id') friend_id: number,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.declineFriendRequest(
      token.split(' ')[1],
      friend_id,
    );

    if (!response) {
      res.status(422).send('Failed to decline friend request');
      return;
    }

    res.status(200).send(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('getYourGames')
  async getYourGames(
    @Headers('authorization') token: string,
    @Res() res: Response,
  ) {
    const games = await this.dbservice.getYourGames(token.split(' ')[1]);

    if (!games) {
      res.status(404).send('No games found');
      return;
    }

    res.status(200).send(games);
  }
}
