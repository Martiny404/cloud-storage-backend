import { Role } from 'src/modules/role/entities/role.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { JwtPayloadType } from '../types/jwt-payload.type';

export class JwtPayload implements JwtPayloadType {
  id: number;
  isActivated: boolean;
  roles: Role[];

  constructor(user: User) {
    this.id = user.id;
    this.isActivated = user.isActivated;
    this.roles = user.roles;
  }
}
