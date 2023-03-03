import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { compare, hash } from 'bcryptjs';
import { AuthResponse } from 'src/common/classes/auth-response.class';
import { JwtPayload } from 'src/common/classes/jwtpayload.class';
import {
  BAD_CREDENTIALS,
  EMAIL_IS_EXIST,
  NICK_IS_EXIST,
  USER_NOT_FOUND,
} from 'src/common/constants/errors/user.errors';
import { FsObjectService } from '../fs-object/services/fs-object.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from '../token/token.service';
import { UserService } from '../user/services/user.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly fsObjectService: FsObjectService,
  ) {}

  async registration(dto: RegisterDto): Promise<number> {
    const isEmailExist = await this.userService.findOneBy({
      where: { email: dto.email },
    });
    if (isEmailExist) {
      throw new BadRequestException(EMAIL_IS_EXIST);
    }

    const isNickExist = await this.userService.findOneBy({
      where: { nickName: dto.nickName },
    });
    if (isNickExist) {
      throw new BadRequestException(NICK_IS_EXIST);
    }
    const hashedPassword = await hash(dto.password, 10);

    const user = await this.userService.createUser({
      email: dto.email,
      password: hashedPassword,
      nickName: dto.nickName,
    });

    const link = await this.userService.addLink(user.id);

    this.fsObjectService.createFolder('', user.id);

    this.mailService.sendActivationMail(user.email, link.link);

    return user.id;
  }

  async login({ email, password }: LoginDto): Promise<AuthResponse> {
    const user = await this.userService.findOneBy({ where: { email } });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new BadRequestException(BAD_CREDENTIALS);
    }
    const payload = new JwtPayload(user);
    const { refreshToken, accessToken } =
      await this.tokenService.generateTokens(payload);

    await this.tokenService.saveToken(user.id, refreshToken);

    return new AuthResponse(payload, accessToken, refreshToken);
  }

  async activate(link: string) {
    return this.userService.activateUser(link);
  }

  async logout(refreshToken: string): Promise<boolean> {
    await this.tokenService.removeToken(refreshToken);
    return true;
  }

  async refresh(token: string): Promise<AuthResponse> {
    return this.tokenService.refresh(token);
  }
}
