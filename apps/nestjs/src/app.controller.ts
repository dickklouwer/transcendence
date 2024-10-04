import {
  Controller,
  Get,
  Headers,
  UseGuards,
  Query,
  Post,
  Body,
  Res,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  FileTypeValidator,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { User, ExternalUser, UserChats, InvitedChats } from '@repo/db';
import { DbService } from './db/db.service';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class AppController {
  constructor(private dbservice: DbService) {}

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

  @Get('checkNickname')
  async checkNickname(@Query('nickname') nickname: string): Promise<boolean> {
    const isUnique = await this.dbservice.CheckNicknameIsUnque(nickname);

    return isUnique;
  }

  @Post('uploadImage')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1000000 } }))
  async uploadImage(
    @Headers('authorization') token: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /image\/.*/ })],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const response = await this.dbservice.getUserFromDataBase(
        token.split(' ')[1],
      );

      await this.dbservice.updateImage(
        response.intra_user_id,
        'data:image/png;base64,' + file.buffer.toString('base64'),
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

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

  @Get('user')
  async getUser(
    @Query('intra_user_id') intra_user_id: number,
    @Res() res: Response,
  ): Promise<User> {
    const user = await this.dbservice.getAnyUserFromDataBase(intra_user_id);

    if (!user) {
      res.status(404).send("User doesn't exist");
    }

    res.status(200).send(user);
    return user;
  }

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

  @Get('invitedChats')
  async getInvitedChats(
    @Headers('authorization') token: string,
  ): Promise<InvitedChats[]> {
    const invitedChats = await this.dbservice.getInvitedChatsFromDataBase(
      token.split(' ')[1],
    );

    if (!invitedChats) throw Error('Failed to fetch user');

    return invitedChats;
  }

  @Get('checkIfBanned')
  async checkIfBanned(
    @Headers('authorization') token: string,
    @Query('chat_id') chat_id: number,
  ): Promise<boolean> {
    const isBanned = await this.dbservice.checkIfUserIsBanned(
      token.split(' ')[1],
      chat_id,
    );

    return isBanned;
  }

  @Post('joinChat')
  async joinChat(
    @Headers('authorization') token: string,
    @Body('chat_id') chat_id: number,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.joinChat(
      token.split(' ')[1],
      chat_id,
    );

    if (!response) {
      res.status(422).send('Failed to join chat');
      return;
    }

    res.status(200).send(response);
  }

  @Post('setChatPassword')
  async setChatPassword(
    @Body('chat_id') chat_id: number,
    @Body('password') password: string | null,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.setChatPassword(chat_id, password);

    if (!response) {
      res.status(422).send('Failed to set password');
      return;
    }

    res.status(200).send(response);
  }

  @Get('chatHasPassword')
  async chatHasPassword(
    @Headers('authorization') token: string,
    @Query('chat_id') chat_id: number,
  ): Promise<boolean> {
    const hasPassword = await this.dbservice.chatHasPassword(
      token.split(' ')[1],
      chat_id,
    );

    return hasPassword;
  }

  @UseGuards(JwtAuthGuard)
  @Get('isValidChatPassword')
  async isValidChatPassword(
    @Headers('authorization') token: string,
    @Query('chat_id') chat_id: number,
    @Query('password') password: string,
    @Res() res: Response,
  ) {
    const isValid = await this.dbservice.isValidChatPassword(
      token.split(' ')[1],
      chat_id,
      password,
    );
    res.status(200).send(isValid);
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages')
  async getMessages(
    @Headers('authorization') token: string,
    @Query('chat_id') chat_id: number,
  ) {
    const messages = await this.dbservice.getMessagesFromDataBase(
      token.split(' ')[1],
      chat_id,
    );

    return messages;
  }

  @UseGuards(JwtAuthGuard)
  @Get('messageStatus')
  async getMessageStatus(
    @Headers('authorization') token: string,
    @Query('message_id') message_id: number,
  ) {
    const status = await this.dbservice.getMessageStatus(
      token.split(' ')[1],
      message_id,
    );

    return status;
  }

  @Post('updateUnreadMessages')
  async updateUnreadMessages(
    @Body('chat_id') chat_id: number,
    @Body('intra_user_id') intra_user_id: number,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.updateUnreadMessages(
      chat_id,
      intra_user_id,
    );

    if (!response) {
      res.status(422).send('Failed to update unread messages');
      return;
    }

    res.status(200).send(response);
  }

  @Post('createMockData')
  async mockData(): Promise<boolean> {
    const response = await this.dbservice.mockData();
    return response;
  }

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

  @Get('getLeaderboard')
  async getLeaderboard() {
    const leaderboard = await this.dbservice.getLeaderboardFromDataBase();

    if (!leaderboard) {
      throw Error('Failed to fetch leaderboard');
    }

    return leaderboard;
  }

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
