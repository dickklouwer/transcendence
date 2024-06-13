import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  /**
   * This Method is used to validate the access code.
   * first creating an url with the access code and other required parameters
   * then sending a post request to 42 API to get the access token
   **/
  async validateCode(accessCode: string): Promise<any> {
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

    console.log(response.data);
    return response.data;
  }
  /**
   * This Method is used to validate the access token.
   * @returns {Promise<any>} - Returns the user profile
   */
  async validateToken(accessToken: any): Promise<any> {
    const { access_token } = accessToken;
    const authUrl = new URL('https://api.intra.42.fr/v2/me');

    const response = await axios.get(authUrl.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = response.data;

    return { id: profile.id, username: profile.login, email: profile.email };
  }

  async CreateJWT(user: any): Promise<string> {
    const jwt_arguments = { userEmail: user.email, user_id: user.id };
    return this.jwtService.sign(jwt_arguments);
  }
}
