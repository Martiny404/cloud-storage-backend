import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getJwtonfig } from 'src/configs/jwt.config';
import { UserModule } from '../user/user.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { Token } from './token.entity';
import { TokenService } from './token.service';

@Module({
  providers: [TokenService, JwtStrategy],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJwtonfig,
    }),
    TypeOrmModule.forFeature([Token]),
    UserModule,
    ConfigModule,
  ],
  exports: [TokenService],
})
export class TokenModule {}
