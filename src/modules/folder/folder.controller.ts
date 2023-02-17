import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { FolderService } from './folder.service';

@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post('/create')
  createFolder(@Body() dto: { name: string; parentId: number }) {
    return this.folderService.createFolder(dto.name, dto.parentId);
  }

  @Get('/get-folder/:id')
  getFolder(@Param('id', new ParseIntPipe()) id: number) {
    return this.folderService.getById(id);
  }
}
