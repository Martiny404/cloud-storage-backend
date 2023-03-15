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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { FileSystemHelpersService } from '../file-system/services/file-system-helpers.service';
import { FileSystemService } from '../file-system/services/file-system.service';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { RoleGuard } from '../token/guards/role.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { RemoveFilesDto } from './dto/remove-files.dto';
import { FsObjectService } from './services/fs-object.service';

@Controller('file')
export class FsObjectController {
  constructor(
    private readonly fsObjectService: FsObjectService,
    private readonly fileSystemService: FileSystemService,
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Get('/download')
  async download(
    @Body('ids') ids: number[],
    @Res({ passthrough: true }) res: Response,
    @Req() req: AppClientRequest,
  ) {
    const userId = req?.user?.id;

    const objects = await this.fsObjectService.findObjects(ids, userId);

    return this.fileSystemService.download(objects, res);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Get('/get-object/:id')
  async getObject(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: AppClientRequest,
  ) {
    const userId = req?.user?.id;
    return this.fsObjectService.getFile({
      where: {
        id: id,
        user: { id: userId },
      },
      relations: {
        children: true,
      },
    });
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
    const file = await this.fsObjectService.findFileByUser(id, userId);
    const path = this.fileSystemHelpersService.getFullPath(file.path);
    const { size } = await stat(path);
    const range = req.headers.range || '0';
    const chunkSize = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, size - 1);
    const stream = createReadStream(path, { start, end });

    const contentLength = end - start + 1;

    const headers = {
      'Content-Type': `${file.mimetype}`,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Disposition': `inline; filename="${file.name}"`,
    };
    res.writeHead(206, headers);
    stream.pipe(res);
  }

  @Get('/serve-file-by-link/:link')
  async serveFileByLink(
    @Param('link') link: string,
    @Res() res: Response,
    @Req() req: AppClientRequest,
  ) {
    const file = await this.fsObjectService.getFileByLink(link);
    const path = this.fileSystemHelpersService.getFullPath(file.path);
    const { size } = await stat(path);
    const range = req.headers.range || '0';
    const chunkSize = 1 * 1e6;
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + chunkSize, size - 1);
    const stream = createReadStream(path, { start, end });

    const contentLength = end - start + 1;

    const headers = {
      'Content-Type': `${file.mimetype}`,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Disposition': `inline; filename="${file.name}"`,
    };
    res.writeHead(206, headers);
    stream.pipe(res);
  }
  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Post('/create-file')
  @UseInterceptors(FileInterceptor('file'))
  createFiles(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AppClientRequest,
    @Query('folderId', new ParseIntPipe()) folderId: number,
  ) {
    const userId = req.user.id;
    return this.fsObjectService.createFile(file, folderId, userId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Post('/create-folder')
  createFolder(@Body() dto: CreateFolderDto, @Req() req: AppClientRequest) {
    const userId = req.user.id;
    return this.fsObjectService.createFolder(dto.name, userId, dto.parentId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Delete('/remove')
  removeFiles(@Body() dto: RemoveFilesDto, @Req() req: AppClientRequest) {
    const userId = req.user.id;
    return this.fsObjectService.removeObjects(dto.ids, userId, dto.folderId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Patch('/generate-public-link/:id')
  generatePublicLink(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: AppClientRequest,
  ) {
    const userId = req.user.id;
    return this.fsObjectService.generatePublicLink(id, userId);
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Patch('/remove-public-link/:id')
  removePublicLink(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req: AppClientRequest,
  ) {
    const userId = req.user.id;
    return this.fsObjectService.removePublicLink(id, userId);
  }

  @Patch('/rename/:id')
  async rename(
    @Param('id', new ParseIntPipe()) id: number,
    @Body('newName') newName: string,
  ) {
    return this.fsObjectService.rename(id, newName);
  }
}
