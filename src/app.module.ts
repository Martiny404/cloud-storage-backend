import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { FileSystemModule } from './modules/file-system/file-system.module';
import { UserModule } from './modules/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeormConfig } from './configs/typeorm.config';
import { MailModule } from './modules/mail/mail.module';
import { RoleModule } from './modules/role/role.module';
import { FolderModule } from './modules/folder/folder.module';
import { FileModule } from './modules/file/file.module';
import { TarifModule } from './modules/tarif/tarif.module';
import { DownloadServeModule } from './modules/download-serve/download-serve.module';

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
    FileSystemModule,
    UserModule,
    MailModule,
    RoleModule,
    FolderModule,
    FileModule,
    TarifModule,
    DownloadServeModule,
  ],
})
export class AppModule {}
