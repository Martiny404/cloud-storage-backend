import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FileSystemController } from './file-system.controller';
import { FileSystemService } from './file-system.service';

@Module({
  controllers: [FileSystemController],
  providers: [FileSystemService],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', '/static'),
      serveRoot: '/static',
    }),
  ],
  exports: [FileSystemService],
})
export class FileSystemModule {}
