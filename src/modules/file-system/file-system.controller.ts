import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { RoleGuard } from '../token/guards/role.guard';
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

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadStaticFiles(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    const newFile = await this.fileSystemHelpersService.filterFile(file);
    return this.fileSystemService.saveStaticFiles(newFile, folder);
  }

  @Delete('/')
  async removeFiles(@Body() dto: RemoveFilesDto) {
    return this.fileSystemService.removeFiles(dto.paths);
  }
}
