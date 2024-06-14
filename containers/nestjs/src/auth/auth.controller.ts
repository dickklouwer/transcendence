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
      return res.status(400).send('Code Undifined Authorization Failed!');
    }

    try {
      const tokenData = await this.authService.validateCode(code);

      const user = await this.authService.validateToken(tokenData);

      const jwt = await this.authService.CreateJWT(user);

      return res.redirect(`http://localhost:4433/?token=${jwt}`);
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
