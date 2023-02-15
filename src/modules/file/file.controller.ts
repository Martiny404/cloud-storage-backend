import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Post,
  Query,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { RemoveFilesDto } from './dto/remove-files.dto';
import { FileService } from './file.service';

@UseFilters(HttpExceptionFilter)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FilesInterceptor('file'))
  async uploadFile(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder?: string,
  ) {
    const newFiles = await this.fileService.filterFiles(files);

    return this.fileService.saveFiles(newFiles, folder);
  }

  @Delete('/')
  async removeFiles(@Body() dto: RemoveFilesDto) {
    return this.fileService.removeFiles(dto.paths);
  }
}
