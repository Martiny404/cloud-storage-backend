import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemModule } from '../file-system/file-system.module';
import { FolderModule } from '../folder/folder.module';
import { File } from './entities/file.entity';
import { FileController } from './file.controller';
import { FileService } from './file.service';

@Module({
  providers: [FileService],
  controllers: [FileController],
  imports: [TypeOrmModule.forFeature([File]), FileSystemModule, FolderModule],
})
export class FileModule {}
