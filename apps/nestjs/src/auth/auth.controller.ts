import {
  Controller,
  UseGuards,
  Get,
  Body,
  Post,
  Query,
  Request,
  Res,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { DbService } from '../db/db.service';
import { FortyTwoUser } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { User } from '@repo/db';

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

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enableTwoFactorAuthentication(@Request() req, @Res() res: Response) {
    const user = req.user as User;
    const { secret, qrCode } =
      await this.authService.enableTwoFactorAuthentication(user);
    res.send({ secret, qrCode });
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(
    @Body() body: { token: string },
    @Res() res: Response,
    @Headers('authorization') JWTtoken: string,
  ) {
    console.log('Verifying 2FA Token');
    const user: User = await this.dbservice.getUserFromDataBase(
      JWTtoken.split(' ')[1],
    );

    console.log(user.two_factor_secret, user.is_two_factor_enabled);

    const isValid = await this.authService.verifyTwoFactorAuthentication(
      user,
      body.token,
    );

    console.log(isValid, user, body.token, '2FA CODE <');
    if (isValid) {
      await this.authService.setTwoFactorAuthenticationEnabled(
        user.user_id,
        true,
      );
      res.send({ message: '2FA verification successful' });
    } else {
      console.log('Invalid 2FA Token');
      res.status(400).send({ message: 'Invalid 2FA token' });
    }
  }
}
