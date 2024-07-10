import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NewUser, userChats } from './auth/auth.service';
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
  @Get('chats')
  async getChats(@Headers('authorization') token: string): Promise<userChats> {
    const userChats = await this.dbservice.getChatsFromDataBase(
      token.split(' ')[1],
    );

    return userChats;
  }
}
