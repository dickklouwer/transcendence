import {
  Controller,
  Get,
  Post,
  Headers,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { NewUser, UserChats } from './auth/auth.service';
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
  @Get('checkNickname')
  async checkNickname(@Query('nickname') nickname: string): Promise<boolean> {
    const isUnique = await this.dbservice.CheckNicknameIsUnque(nickname);

    return isUnique;
  }

  @UseGuards(JwtAuthGuard)
  @Get('setNickname')
  async setNickname(
    @Headers('authorization') token: string,
    @Query('nickname') nickname: string,
  ): Promise<boolean> {
    const response = await this.dbservice.setUserNickname(
      token.split(' ')[1],
      nickname,
    );

    return response;
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
