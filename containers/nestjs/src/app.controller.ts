import { Body, Controller, Get, Post, Headers, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NewUser, UserChats, AuthService } from './auth/auth.service';
import { DbService } from './db/db.service';

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
  async getProfile(@Headers('authorization') token: string): Promise<NewUser> {
    const user = await this.dbservice.getUserFromDataBase(token.split(' ')[1]);

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUser(
    @Headers('authorization') intra_user_id: number,
  ): Promise<NewUser> {
    const user = await this.dbservice.getAnyUserFromDataBase(intra_user_id);

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
    return userChats;
  }
}
