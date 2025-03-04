import {
  Controller,
  UseGuards,
  Get,
  Body,
  Post,
  Query,
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
      const fortyTwoUser = await this.authService.validateToken(token);
      console.log('User:', fortyTwoUser);

      // Check if the user exists in our database
      let dbUser = await this.dbservice.getUserById(fortyTwoUser.intra_user_id);

      if (!dbUser) {
        // If the user doesn't exist in our database, create a new user
        dbUser = await this.dbservice.upsertUserInDataBase(fortyTwoUser);
      }

      if (dbUser.is_two_factor_enabled) {
        // If 2FA is enabled, create a temporary token
        const tempToken = await this.authService.createTemporaryToken(dbUser);
        return res.redirect(
          `http://${process.env.HOST_NAME}:4433/2fa/verify_2fa?tempToken=${tempToken}`,
        );
      } else {
        // If 2FA is not enabled, create and return the JWT
        const jwt = await this.authService.CreateJWT(dbUser);
        dbUser.token = jwt;
        await this.dbservice.upsertUserInDataBase(dbUser);
        return res.redirect(
          `http://${process.env.HOST_NAME}:4433/?token=${jwt}`,
        );
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        res.status(error.response?.status).send(error.response.data);
        return;
      }
      res.status(403).send('Authentication Failed Please Try again');
    }
  }

  @Post('2fa/login-verify')
  async verifyTwoFactorAuthenticationForLogin(
    @Body() body: { tempToken: string; twoFactorCode: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.getUserFromTemporaryToken(
        body.tempToken,
      );
      const isValid = await this.authService.verifyTwoFactorAuthentication(
        user,
        body.twoFactorCode,
      );

      if (isValid) {
        const jwt = await this.authService.CreateJWT(user);
        user.token = jwt;
        await this.dbservice.upsertUserInDataBase(user);
        res.status(200).send(jwt);
      } else {
        res.status(403).send('Invalid 2FA code');
      }
    } catch (error) {
      console.log(error);
      res
        .status(403)
        .json({ message: 'Authentication Failed Please Try again' });
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
    const fortyTwoUser: FortyTwoUser = {
      intra_user_id: uuid,
      user_name: username + '_dev',
      email: username + '@dev.com',
      state: 'Online',
      image_url:
        'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg',
      token: null,
    };

    try {
      const dbUser = await this.dbservice.upsertUserInDataBase(fortyTwoUser);

      if (!dbUser) {
        return res.status(500).send('Failed to create or update user');
      }

      dbUser.token = await this.authService.CreateJWT(dbUser);

      // Update the user with the new token
      await this.dbservice.upsertUserInDataBase({
        ...fortyTwoUser,
        token: dbUser.token,
      });

      return res.redirect(
        `http://${process.env.HOST_NAME}:4433/?token=${dbUser.token}`,
      );
    } catch (error) {
      console.error('Error in dev validation:', error);
      return res.status(500).send('User creation or update failed');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enableTwoFactorAuthentication(
    @Headers('authorization') JWTtoken: string,
    @Res() res: Response,
  ) {
    const user: User = await this.dbservice.getUserFromDataBase(
      JWTtoken.split(' ')[1],
    );
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
        user.intra_user_id,
        true,
      );
      res.send({ message: '2FA verification successful' });
    } else {
      console.log('Invalid 2FA Token');
      res.status(400).send({ message: 'Invalid 2FA token' });
    }
  }
}
