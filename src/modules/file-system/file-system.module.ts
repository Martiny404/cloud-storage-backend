import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FileSystemController } from './file-system.controller';
import { FileSystemHelpersService } from './services/file-system-helpers.service';
import { FileSystemService } from './services/file-system.service';

@Module({
  controllers: [FileSystemController],
  providers: [FileSystemService, FileSystemHelpersService],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'static'),
      serveRoot: '/static',
    }),
  ],
  exports: [FileSystemService, FileSystemHelpersService],
})
export class FileSystemModule {}
