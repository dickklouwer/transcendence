import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { users } from '../../drizzle/schema';

export type NewUser = typeof users.$inferInsert;

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  /**
   * This Method is used to validate the access code.
   * first creating an url with the access code and other required parameters
   * then sending a post request to 42 API to get the access token
   **/
  async validateCode(accessCode: string): Promise<string> {
    const tokenUrl = new URL('https://api.intra.42.fr/oauth/token');

    tokenUrl.searchParams.append(
      'client_id',
      process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_ID,
    );
    tokenUrl.searchParams.append(
      'client_secret',
      process.env.NEXT_PUBLIC_FORTY_TWO_CLIENT_SECRET,
    );
    tokenUrl.searchParams.append('code', accessCode);
    tokenUrl.searchParams.append(
      'redirect_uri',
      'http://127.0.0.1:4242/auth/validate',
    );
    tokenUrl.searchParams.append('grant_type', 'authorization_code');

    const response = await axios.post(tokenUrl.toString(), null);

    return response.data.access_token;
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
      image: profile.image.link,
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
