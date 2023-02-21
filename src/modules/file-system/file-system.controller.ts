import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { RemoveFilesDto } from './dto/remove-files.dto';
import { FileSystemHelpersService } from './services/file-system-helpers.service';
import { FileSystemService } from './services/file-system.service';

@UseFilters(HttpExceptionFilter)
@Controller('file-system')
export class FileSystemController {
  constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('file'))
  async uploadStaticFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    const newFiles = await this.fileSystemHelpersService.filterFiles(files);
    return this.fileSystemService.saveStaticFiles(newFiles, folder);
  }

  @Delete('/')
  async removeFiles(@Body() dto: RemoveFilesDto) {
    return this.fileSystemService.removeFiles(dto.paths);
  }

  @Get('/download')
  download(
    @Query('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.fileSystemService.download(path, res);
  }
}
