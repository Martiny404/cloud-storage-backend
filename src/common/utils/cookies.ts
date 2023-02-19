import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CookiesTokens } from '../types/cookies.interface';

export const clearCookies = (res: Response) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
};

export const setCookies = (
  res: Response,
  tokens: CookiesTokens,
  configService: ConfigService,
) => {
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * parseInt(configService.get('REFRESH_TOKEN_EXPIRES')),
  });
  if (tokens.accessToken) {
    res.cookie('accessToken', tokens.accessToken, {
      maxAge: 1000 * 60 * parseInt(configService.get('ACCESS_TOKEN_EXPIRES')),
    });
  }
};
