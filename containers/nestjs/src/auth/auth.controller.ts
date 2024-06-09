import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('validate')
  async validateFortyTwo(@Query('code') code: string, @Res() res: Response) {
    if (!code) {
      return res.status(400).send('Code Undifined Authorization Failed!');
    }

    try {
      const tokenData = await this.authService.validateCode(code);

      const user = await this.authService.validateToken(tokenData);

      console.log(user);

      // const jwt = await this.authService.CreateJWT(user);

    } catch (error) {
      console.log(error);
      res.status(500).send('Authentication Failed Please Try again');
    }
  }
}
