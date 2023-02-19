import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { TokenModule } from '../token/token.module';
import { FolderModule } from '../folder/folder.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [UserModule, MailModule, TokenModule, FolderModule, ConfigModule],
})
export class AuthModule {}
