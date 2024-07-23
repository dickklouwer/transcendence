import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
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
}
