import {
  Controller,
  Get,
  Query,
  Res,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { DbService } from '../db/db.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { NewUser } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private dbservice: DbService,
  ) {}

  @Get('validate')
  async validateFortyTwo(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Code Undifined Authorization Failed!');
    }

    try {
      const tokenData = await this.authService.validateCode(code);
      const user = await this.authService.validateToken(tokenData);
      const jwt = await this.authService.CreateJWT(user);

      user.token = jwt;

      await this.dbservice.createUserInDataBase(user);

      return res.redirect(`http://localhost:4433/?token=${user.token}`);
    } catch (error) {
      console.log(error);
      res.status(500).send('Authentication Failed Please Try again');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Headers('authorization') token: string): Promise<NewUser> {
    const user = await this.dbservice.getUserFromDataBase(token.split(' ')[1]);

    return user;
  }
}
