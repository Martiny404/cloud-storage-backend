import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AppClientRequest } from 'src/common/types/client-request.interface';
import { Roles } from 'src/decorators/roles.decorator';
import { HttpExceptionFilter } from 'src/exception-filters/http-exception.filter';
import { AuthorizationGuard } from '../token/guards/authorization.guard';
import { RoleGuard } from '../token/guards/role.guard';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';

@UseFilters(HttpExceptionFilter)
@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Post('/create')
  createFolder(@Body() dto: CreateFolderDto, @Req() req: AppClientRequest) {
    const userId = req.user.id;
    return this.folderService.createFolder(dto, userId);
  }

  @Get('/get-folder/:id')
  getFolder(@Param('id', new ParseIntPipe()) id: number) {
    return this.folderService.findFolderBy({ where: { id } });
  }

  @UseGuards(AuthorizationGuard, RoleGuard)
  @Roles('USER')
  @Delete('/remove')
  removeFolders(@Body('ids') ids: number[], @Req() req: AppClientRequest) {
    const userId = req.user.id;
    return this.folderService.removeFolders(ids, userId);
  }

  @Get('/folder-size/:id')
  getFolderSize(@Param('id', new ParseIntPipe()) id: number) {
    return this.folderService.getFolderSize(id);
  }
}
