import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileSystemModule } from '../file-system/file-system.module';
import { FsObject } from './entities/fs-object.entity';
import { FsObjectController } from './fs-object.controller';
import { FsObjectService } from './services/fs-object.service';

@Module({
  providers: [FsObjectService],
  controllers: [FsObjectController],
  imports: [TypeOrmModule.forFeature([FsObject]), FileSystemModule],
  exports: [FsObjectService],
})
export class FsObjectModule {}
