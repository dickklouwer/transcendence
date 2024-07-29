import { Controller, UseGuards, Get, Body, Post, Query, Request, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DbService } from '../db/db.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response } from 'express';
import { User } from './user.interface';

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

      await this.dbservice.createUserInDataBase(user);

      if (user.is_two_factor_enabled) {
        return res.redirect(`http://localhost:4433/?token=${user.token}&2fa=true`);
      } else {
        return res.redirect(`http://localhost:4433/?token=${user.token}`);
      }
    } catch (error) {
      console.log(error);
      res.status(500).send('Authentication Failed Please Try again');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  async enableTwoFactorAuthentication(@Request() req, @Res() res: Response) {
    const user = req.user as User;
    const { secret, qrCode } = await this.authService.enableTwoFactorAuthentication(user);
    res.send({ secret, qrCode });
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactorAuthentication(@Request() req, @Body() body: { token: string }, @Res() res: Response) {
    console.log("Verifying 2FA Token");
    const user = req.user as User;
    
    console.log(user.two_factor_secret, user.is_two_factor_enabled);
  
    const isValid = await this.authService.verifyTwoFactorAuthentication(user, body.token);
  
    console.log(isValid, user, body.token, "2FA CODE <");
    if (isValid) {
      await this.authService.setTwoFactorAuthenticationEnabled(user.user_id, true);
      res.send({ message: '2FA verification successful' });
    } else {
      console.log("Invalid 2FA Token");
      res.status(400).send({ message: 'Invalid 2FA token' });
    }
  }
}