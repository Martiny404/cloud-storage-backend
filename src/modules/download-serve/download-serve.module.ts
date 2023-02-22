import { Module } from '@nestjs/common';
import { FileSystemModule } from '../file-system/file-system.module';

import { FileModule } from '../file/file.module';
import { FolderModule } from '../folder/folder.module';
import { DownloadServeController } from './download-serve.controller';
import { DownloadServeService } from './download-serve.service';

@Module({
  controllers: [DownloadServeController],
  providers: [DownloadServeService],
  imports: [FolderModule, FileModule, FileSystemModule],
})
export class DownloadServeModule {}
