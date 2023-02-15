import { JwtPayload } from '../classes/jwtpayload.class';
import { Tokens } from './tokens.interface';

export interface IAuthResponse extends Tokens {
  userInfo: JwtPayload;
}
