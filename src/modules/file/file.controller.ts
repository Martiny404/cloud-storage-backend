import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { FileSystemHelpersService } from '../file-system/services/file-system-helpers.service';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { RoleGuard } from '../token/guards/role.guard';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}

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

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Patch('/generate-public-link/:id')
  generatePublicLink(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: AppClientRequest,
  ) {
    const userId = req.user.id;
    return this.fileService.generatePublicLink(id, userId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Patch('/remove-public-link/:id')
  removePublicLink(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: AppClientRequest,
  ) {
    const userId = req.user.id;
    return this.fileService.removePublicLink(id, userId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Get('/serve-file/:id')
  async serveFile(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: AppClientRequest,
    @Res() res: Response,
  ) {
    const userId = req?.user?.id;
    const file = await this.fileService.findFileByUser(id, userId);
    const buffer = await this.fileSystemHelpersService.serveFile(file);
    res.statusCode = 200;
    res.write(buffer);
    return res.end();
  }

  @Get('/serve-file-by-link/:link')
  async serveFileByLink(@Param('link') link: string, @Res() res: Response) {
    const file = await this.fileService.getFileByLink(link);
    const buffer = await this.fileSystemHelpersService.serveFile(file);
    res.statusCode = 200;
    res.write(buffer);
    return res.end();
  }

  @Patch('/rename/:id')
  async rename(
    @Param('id', new ParseIntPipe()) id: number,
    @Body('newName') newName: string,
  ) {
    return this.fileService.rename(id, newName);
  }
}
