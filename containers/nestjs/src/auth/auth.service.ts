import {Injectable,InternalServerErrorException, Controller, Get, Body, Post, Query, Res, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { users } from '../../drizzle/schema'
import { DbService } from '../db/db.service';
import { TwoFactorAuthenticationService } from './2fa.service';
import { User } from './user.interface';

export type NewUser = typeof users.$inferInsert;
export type UserChats = {
  messageId: number;
  type: string;
  title: string;
  image: string;
  lastMessage: string;
  time: Date;
  unreadMessages: number;
};

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private dbService: DbService,
  ) {}

  /**
   * This Method is used to validate the access code.
   * first creating an url with the access code and other required parameters
   * then sending a post request to 42 API to get the access token
   **/
  async validateCode(accessCode: string): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Client ID or Secret is not defined');
    }

    const tokenUrl = 'https://api.intra.42.fr/oauth/token';
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: accessCode,
      redirect_uri: 'http://127.0.0.1:4242/auth/validate',
      grant_type: 'authorization_code',
    });

    console.log('Token URL:', tokenUrl);
    console.log('Parameters:', params.toString());

    try {
      const response = await axios.post(tokenUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (!response.data.access_token) {
      throw new InternalServerErrorException('Access token not received');
    }

    console.log('Access Token:', response.data.access_token);
    return response.data.access_token;
    } catch (error) {
      console.error('Error validating code:', error.response?.data || error.message);
      throw new InternalServerErrorException('Error validating access code'); 
    }
  }

  async enableTwoFactorAuthentication(user: User) {
    const secret = this.twoFactorAuthenticationService.generateSecret();
    const qrCode = await this.twoFactorAuthenticationService.generateQrcode(secret.otpauthUrl);

    // const user = req.user as User;
    console.log('User:', user);
    await this.dbService.updateUserTwoFactorSecret(user.user_id, secret.base32);

    return { secret: secret.base32, qrCode };
  }

  async setTwoFactorAuthenticationEnabled(userId: number, enabled: boolean) {
    await this.dbService.setUserTwoFactorEnabled(userId, enabled);
  }

  async verifyTwoFactorAuthentication(user: User, token: string) {
    const userSecret = user.two_factor_secret;
    
    if (!userSecret) {
      throw new InternalServerErrorException('2FA secret not found');
    }

    return this.twoFactorAuthenticationService.verifytoken(userSecret, token);
  }
  /**
   * This Method is used to validate the access token.
   * @returns {Promise<any>} - Returns the user profile
   */
  async validateToken(accessToken: string): Promise<NewUser> {
    const response = await axios.get('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = response.data;
    console.log(profile.image.link);

    const tmp: NewUser = {
      intra_user_id: profile.id,
      user_name: profile.login,
      token: null,
      email: profile.email,
      state: 'Online',
      image_url: profile.image.link,
    };

    return tmp;
  }
  
  async CreateJWT(user: NewUser): Promise<string> {
    const jwt_arguments = {
      userEmail: user.email,
      user_id: user.intra_user_id,
    };
    return this.jwtService.sign(jwt_arguments);
  }
}
