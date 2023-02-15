import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { FileModule } from './modules/file/file.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeormConfig } from './configs/typeorm.config';
import { MailModule } from './modules/mail/mail.module';
import { RoleModule } from './modules/role/role.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getTypeormConfig,
    }),

    AuthModule,
    TokenModule,
    FileModule,
    UserModule,
    MailModule,
    RoleModule,
  ],
})
export class AppModule {}
