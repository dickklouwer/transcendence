import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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

      return res.redirect(`http://localhost:4433/?token=${user.token}`);
    } catch (error) {
      console.log(error);
      res.status(500).send('Authentication Failed Please Try again');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(req, @Res() res: Response) {
    return res.send({ str: 'Hello World!' });
  }
}
