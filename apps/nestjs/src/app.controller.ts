import {
  Controller,
  Get,
  Headers,
  UseGuards,
  Query,
  Post,
  Body,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UserChats } from './auth/auth.service';
import type { User } from '@repo/db';
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
    console.log('User Fetched!:', user);
    if (!user) {
      res.status(404).send("User doesn't exist");
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
      res.status(400).send(`Nickname is not unique`);
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
}
