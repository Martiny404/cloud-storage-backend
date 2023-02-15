import { Request } from 'express';
import { User } from 'src/modules/user/entities/user.entity';

export interface AppClientRequest extends Request {
  user: User;
}
