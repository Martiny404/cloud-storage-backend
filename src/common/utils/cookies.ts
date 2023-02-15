import { Response } from 'express';
import { CookiesTokens } from '../types/cookies.interface';

export const clearCookies = (res: Response) => {
  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');
};

export const setCookies = (res: Response, tokens: CookiesTokens) => {
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 21,
  });
  if (tokens.accessToken) {
    res.cookie('accessToken', tokens.accessToken, {
      maxAge: 1000 * 60 * 30,
    });
  }
};
