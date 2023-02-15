import { IAuthResponse } from '../types/auth-response.interface';
import { JwtPayload } from './jwtpayload.class';

export class AuthResponse implements IAuthResponse {
  userInfo: JwtPayload;
  accessToken: string;
  refreshToken: string;

  constructor(userInfo: JwtPayload, accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.userInfo = userInfo;
  }
}
