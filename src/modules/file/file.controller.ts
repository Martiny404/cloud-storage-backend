import {
  Body,
  Controller,
  Delete,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { RoleGuard } from '../token/guards/role.guard';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Post('/create')
  @UseInterceptors(FilesInterceptor('file'))
  createFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: AppClientRequest,
    @Query('folderId', new ParseIntPipe()) folderId: number,
  ) {
    const userId = req.user.id;
    return this.fileService.createFile(files, folderId, userId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Delete('/remove')
  removeFiles(@Body('ids') ids: number[], @Req() req: AppClientRequest) {
    const userId = req.user.id;
    return this.fileService.removeFiles(ids, userId);
  }
}
