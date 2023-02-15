import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthResponse } from 'src/common/classes/auth-response.class';
import { JwtPayload } from 'src/common/classes/jwtpayload.class';
import {
  TOKEN_NOT_FOUND,
  UNAUTHORIZED,
} from 'src/common/constants/errors/token.errors';
import { USER_NOT_FOUND } from 'src/common/constants/errors/user.errors';
import { Tokens } from 'src/common/types/tokens.interface';

import { Repository } from 'typeorm';
import { UserService } from '../user/services/user.service';
import { Token } from './token.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<Tokens> {
    const accessToken = await this.jwtService.signAsync(
      { ...payload },
      {
        expiresIn: '1m',
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload },
      {
        expiresIn: '3m',
        secret: this.configService.get('JWT_SECRET_REFRESH'),
      },
    );
    return {
      accessToken,
      refreshToken,
    };
  }

  async saveToken(userId: number, refreshToken: string): Promise<Token> {
    const userToken = await this.tokenRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });
    if (!userToken) {
      const token = this.tokenRepository.create({
        refreshToken,
        user: {
          id: userId,
        },
      });
      return await this.tokenRepository.save(token);
    }
    userToken.refreshToken = refreshToken;
    return await this.tokenRepository.save(userToken);
  }

  async verifyToken(refreshToken: string): Promise<JwtPayload> {
    const payload = await this.jwtService.verifyAsync<JwtPayload>(
      refreshToken,
      {
        secret: this.configService.get('JWT_SECRET_REFRESH'),
      },
    );
    return payload;
  }

  async removeToken(refreshToken: string): Promise<void> {
    await this.tokenRepository.delete({
      refreshToken,
    });
  }

  async findToken(refreshToken: string): Promise<Token> {
    const token = await this.tokenRepository.findOne({
      where: {
        refreshToken,
      },
    });
    if (!token) {
      throw new NotFoundException(TOKEN_NOT_FOUND);
    }
    return token;
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    if (!refreshToken) {
      throw new UnauthorizedException(UNAUTHORIZED);
    }
    const payload = await this.verifyToken(refreshToken);
    await this.findToken(refreshToken);

    const user = await this.userService.findOneBy({
      where: { id: payload.id },
    });

    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }

    const newPayload: JwtPayload = new JwtPayload(user);

    const newTokens = await this.generateTokens(newPayload);

    await this.saveToken(user.id, newTokens.refreshToken);

    return new AuthResponse(
      newPayload,
      newTokens.accessToken,
      newTokens.refreshToken,
    );
  }
}
