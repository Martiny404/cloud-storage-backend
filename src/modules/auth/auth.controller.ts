import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';

import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { clearCookies, setCookies } from 'src/common/utils/cookies';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { ConfigService } from '@nestjs/config';

@UseFilters(HttpExceptionFilter)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}
  @Post('/registration')
  async registration(@Body() dto: RegisterDto) {
    return this.authService.registration(dto);
  }

  @Post('/login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const data = await this.authService.login(dto);
    setCookies(
      res,
      {
        refreshToken: data.refreshToken,
        accessToken: data.accessToken,
      },
      this.configService,
    );
    return res.status(200).json(data);
  }

  @Get('activate/:link')
  async activate(@Param('link') activationLink: string, @Res() res: Response) {
    await this.authService.activate(activationLink);
    return res.redirect('https://ya.ru/');
  }

  @Post('logout')
  async logout(@Res() res: Response, @Req() req: AppClientRequest) {
    const token = req.cookies.refreshToken as string;
    const result = await this.authService.logout(token);
    clearCookies(res);
    res.status(200).json(result);
  }

  @Post('refresh')
  async refresh(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies.refreshToken as string;
    const data = await this.authService.refresh(refreshToken);
    setCookies(
      res,
      {
        refreshToken: data.refreshToken,
        accessToken: data.accessToken,
      },
      this.configService,
    );
    return res.status(200).json(data);
  }
}
