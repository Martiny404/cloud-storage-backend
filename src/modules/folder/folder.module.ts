import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { Folder } from './entities/folder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemModule } from '../file-system/file-system.module';

@Module({
  imports: [TypeOrmModule.forFeature([Folder]), FileSystemModule],
  providers: [FolderService],
  controllers: [FolderController],
  exports: [FolderService],
})
export class FolderModule {}
