import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService, FortyTwoUser } from './auth.service';
import { DbService } from '../db/db.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private dbservice: DbService,
  ) {}

  @Get('validate')
  async validateFortyTwo(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Code Undefined Authorization Failed!');
    }

    try {
      console.log('Starting code validation ...');
      const token = await this.authService.validateCode(code);
      console.log('Token:', token);

      const user = await this.authService.validateToken(token);
      console.log('User:', user);

      const jwt = await this.authService.CreateJWT(user);
      console.log('JWT::', jwt);
      user.token = jwt;

      await this.dbservice.upsertUserInDataBase(user);

      return res.redirect(`http://localhost:4433/?token=${user.token}`);
    } catch (error) {
      console.log(error);
      res.status(500).send('Authentication Failed Please Try again');
    }
  }

  @Post('dev_validate')
  async devValidateTranscendence(
    @Body('username') username: string,
    @Res() res: Response,
  ) {
    if (!username) {
      return res.status(400).send('Username Undefined Authorization Failed!');
    }

    console.log('Starting code validation ...');

    let uuid: number = 0;

    for (let i = 0; i < username.length; i++) {
      uuid += username.charCodeAt(i);
    }

    const user: FortyTwoUser = {
      intra_user_id: uuid,
      user_name: username + '_dev',
      email: username + '@dev.com',
      state: 'Online',
      image:
        'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg',
      token: null,
    };
    user.token = await this.authService.CreateJWT(user);
    console.log('JWT::', user.token);

    await this.dbservice.upsertUserInDataBase(user).then((result) => {
      if (result == false)
        return res.status(500).send('User Could be already Created!');
    });
    return res.redirect(`http://localhost:4433/?token=${user.token}`);
  }
}
