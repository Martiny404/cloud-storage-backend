import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { RemoveFilesDto } from './dto/remove-files.dto';
import { FileSystemService } from './file-system.service';

@UseFilters(HttpExceptionFilter)
@Controller('file')
export class FileSystemController {
  constructor(private readonly fileSystemService: FileSystemService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    const newFiles = await this.fileSystemService.filterFiles(files);

    return this.fileSystemService.saveFiles(newFiles, folder);
  }

  @Delete('/')
  async removeFiles(@Body() dto: RemoveFilesDto) {
    return this.fileSystemService.removeFiles(dto.paths);
  }

  @Get('/download')
  download(
    @Query('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ): StreamableFile {
    const baseName = this.fileSystemService.getBaseName(path);
    const file = createReadStream(join(__dirname, '..', '..', '..', path));
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${baseName}"`,
    });
    return new StreamableFile(file);
  }
}
