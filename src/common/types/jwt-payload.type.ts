import { User } from 'src/modules/user/entities/user.entity';

export type JwtPayloadType = Pick<User, 'id' | 'isActivated' | 'roles'>;
