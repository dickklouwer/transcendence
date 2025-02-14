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
import {
  User,
  ExternalUser,
  UserChats,
  InvitedChats,
  ChatsUsers,
  ChatSettings,
  chats,
} from '@repo/db';
import { DbService } from './db/db.service';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('api')
export class AppController {
  constructor(private dbservice: DbService) { }

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
      res.status(401).send("User doesn't exist");
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

  @Get(`getChatSettings`)
  async getChatSettings(
    @Headers('authorization') token: string,
    @Query('chatId') chatId: number,
    @Res() res: Response,
  ): Promise<ChatSettings> {
    const user = await this.dbservice.getUserFromDataBase(token.split(' ')[1]);
    const chatSettings = await this.dbservice.getChatSettings(
      token.split(' ')[1],
      chatId,
    );
    if (!user) {
      throw Error('Failed to fetch user');
    }
    if (chatSettings === null) {
      throw Error('Failed to fetch chatSettings');
    }

    for (let i: number = 0; i < chatSettings.userInfo.length; i++) {
      const chatUser = chatSettings.userInfo[i];
      if (chatUser.intra_user_id === user.intra_user_id) {
        res.status(200).send(chatSettings);
        return;
      }
    }
    console.log("We've not seen user in chatsUsers");
    res.status(422).send('User not in chat');
  }

  @Post('createChat')
  async createChat(
    @Headers('authorization') token: string,
    @Body('ChatSettings') ChatSettings: ChatSettings,
    @Res() res: Response,
  ) {
    const user = await this.dbservice.getUserFromDataBase(token.split(' ')[1]);
    if (!user) {
      res.status(422).send('Failed to get user');
      return;
    }

    console.log('BE - host:', user.intra_user_id);

    const chat_id = await this.dbservice.createChat(
      token.split(' ')[1],
      ChatSettings,
    );
    if (chat_id === 0) {
      res.status(422).send('Failed to create chat');
      return;
    }

    const userSettings: ChatsUsers = {
      intra_user_id: user.intra_user_id,
      chat_id: chat_id,
      chat_user_id: 0,
      is_owner: true,
      is_admin: true,
      is_banned: false,
      mute_untill: null,
      joined: true,
      joined_at: null,
    };

    // add host to chat
    let status = await this.dbservice.createChatUsers(
      token.split(' ')[1],
      chat_id,
      userSettings,
    );
    // NOTE: if Host can't be added only then remove the Chat from the chats table
    if (!status) {
      res.status(422).send(`Failed to add Host[${user}] to chat[${chat_id}]`);
      return;
    }

    // add other users to chat
    for (let user of ChatSettings.userInfo) {
      status = await this.dbservice.createChatUsers(
        token.split(' ')[1],
        chat_id,
        user,
      );

      if (!status) {
        res.status(422).send(`Failed to add user[${user}] to chat[${chat_id}]`);
      }
    }
    res.status(201).send(res);
  }

  @Post('updateChatSettings')
  async updateChatSettings(
    @Headers('authorization') token: string,
    @Body('chatId') chatId: number,
    @Body('oldPWD') oldPWD: string,
    @Body('newPWD') newPWD: string,
    @Body('updatedChatSettings') updatedChatSettings: ChatSettings,
    @Body('addedUsers') addedUsers: number[],
    @Body('removedUsers') removedUsers: number[],
    @Res() res: Response
  ) {
    // [x] updatepassword
    // [x] change settings.
    // [x] add new users to ChatSettings
    // [x] change chatUserPermissions ChatSettings
    const hasPassword = await this.dbservice.chatHasPassword(
      token.split(' ')[1],
      chatId
    )

    if (!hasPassword && newPWD.length == 0) { }
    else if (!hasPassword && !newPWD.length)
      this.dbservice.setChatPassword(chatId, newPWD);
    else if (hasPassword && await this.dbservice.isValidChatPassword(
      token.split(' ')[1],
      chatId,
      oldPWD)) {
      if (newPWD.length == 0) { }
      else this.dbservice.setChatPassword(chatId, newPWD);
    }
    else {
      res.status(401).send(`Invalid Password`)
      return
    }

    console.log('BE - title: ', updatedChatSettings.title);
    console.log('BE - private: ', updatedChatSettings.isPrivate);
    await this.dbservice.updateChatSettings(
      token.split(' ')[1],
      chatId,
      updatedChatSettings,
    );

    for (let user of removedUsers) {
      const status = await this.dbservice.removeChatUsers(
        token.split(' ')[1],
        chatId,
        user,
      );
      if (!status) res.status(422).send(`Failed to add user[${user}] to chat[${chatId}]`);
    }

    for (let user of addedUsers) {
      const chatUser: ChatsUsers = {
        intra_user_id: user, chat_id: chatId, chat_user_id: 0,
        is_owner: false, is_admin: false, is_banned: false, mute_untill: null, joined: false,
        joined_at: null,
      };

      const status = await this.dbservice.createChatUsers(
        token.split(' ')[1],
        chatId,
        chatUser,
      );

      if (!status) res.status(422).send(`Failed to add user[${user}] to chat[${chatId}]`);
    }
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

  @UseGuards(JwtAuthGuard)
  @Get('getChatInfo')
  async getDmInfo(
    @Headers('authorization') token: string,
    @Query('chat_id') chat_id: number,
  ) {
    const dmInfo = await this.dbservice.getChatInfo(
      token.split(' ')[1],
      chat_id,
    );

    return dmInfo;
  }

  @Post('updateStatusReceivedMessages')
  async updateStatusReceivedMessages(
    @Body('chat_id') chat_id: number,
    @Body('intra_user_id') intra_user_id: number,
    @Res() res: Response,
  ) {
    const response = await this.dbservice.updateStatusReceivedMessages(
      chat_id,
      intra_user_id,
    );

    if (!response) {
      res.status(422).send('Failed to update unread messages');
      return;
    }

    res.status(200).send(response);
  }

  @Get('getNumberOfUnreadChats')
  async getNumberOfUnreadChats(
    @Headers('authorization') token: string,
  ): Promise<number> {
    const numberOfUnreadChats = await this.dbservice.getNumberOfUnreadChats(
      token.split(' ')[1],
    );

    return numberOfUnreadChats;
  }

  @Post('updateMessageStatusReceived')
  async updateMessageStatusReceived(
    @Body('user_intra_id') user_intra_id: number,
    @Res() res: Response,
  ) {
    const response =
      await this.dbservice.updateMessageStatusReceived(user_intra_id);

    if (!response) {
      res.status(422).send('Failed to update message status');
      return;
    }

    res.status(200).send(response);
  }

  @Get('getAmountGameInvites')
  async getAmountGameInvites(
    @Headers('authorization') token: string,
  ): Promise<number> {
    const invitedForGame = await this.dbservice.getAmountGameInvites(
      token.split(' ')[1],
    );

    return invitedForGame;
  }

  @Get('checkIfInvidedForGame')
  async checkIfInvidedForGame(
    @Headers('authorization') token: string,
    @Query('other_intra_id') other_intra_id: number,
  ): Promise<boolean> {
    const invitedForGame = await this.dbservice.checkIfInvidedForGame(
      token.split(' ')[1],
      other_intra_id,
    );

    return invitedForGame;
  }

  @Post('createMockData')
  async mockData(): Promise<boolean> {
    const response = await this.dbservice.mockData();
    return response;
  }

  @Get('getExternalUsersFromChat')
  async getExternalUsersFromChat(
    @Query('chatId') chatId: number,
    @Res() res: Response,
  ): Promise<ExternalUser[]> {
    const users = await this.dbservice.getChatUsers(chatId);
    const externalUsers: ExternalUser[] = [];
    for (const user of users) {
      const externalUser = await this.dbservice.getExternalUser(user);
      if (!externalUser) res.status(404).send('No users found');
      externalUsers.push(externalUser);
    }
    //    console.log('BE - getExternalUsersFromChat: ', externalUsers);
    res.status(200).send(externalUsers);
    return externalUsers;
  }

  @Get('getExternalUsers')
  async getExternalUsers(
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
  @Get('getExternalUser')
  async searchExternal(
    @Query('id') id: number,
    @Res() res: Response,
  ): Promise<ExternalUser> {
    const user = await this.dbservice.getExternalUser(id);

    if (!user) {
      res.status(404).send('No users found');
      return;
    }
    console.log('BE - getExternalUser: ', user.user_name, user.intra_user_id);
    res.status(200).send(user);
    return user;
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
  @Get('getApprovedFriendsById')
  async getApprovedFriendsById(@Query('id') id: number, @Res() res: Response) {
    const friends = await this.dbservice.getFriendsApprovedFromDataBaseById(id);

    if (!friends) {
      res.status(404).send('No friends found');
      return;
    }

    res.status(200).send(friends);
  }

  @UseGuards(JwtAuthGuard)
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
    /*
    const data = await this.authService.decryptJWT(token.split(' ')[1]);
    data.user_id
    */
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
