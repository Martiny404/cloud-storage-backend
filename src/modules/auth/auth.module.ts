import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { TokenModule } from '../token/token.module';
import { ConfigModule } from '@nestjs/config';
import { FsObjectModule } from '../fs-object/fs-object.module';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UserModule, MailModule, TokenModule, ConfigModule, FsObjectModule],
})
export class AuthModule {}
