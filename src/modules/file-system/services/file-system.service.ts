import {
  BadRequestException,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';
import { mkdir, rm, rmdir, lstat } from 'fs/promises';
import { join, parse } from 'path';
import { MFile } from '../classes/mfile.class';
import { BadTry } from '../classes/bad-try.class';
import { createReadStream, existsSync } from 'fs';
import {
  DUPLICATE_FOLDER_NAME,
  FILE_NOT_FOUND,
} from 'src/common/constants/errors/file-system.errors';
import { FileSystemHelpersService } from './file-system-helpers.service';
import { SaveFileResponse } from '../classes/save-file-response.class';
import { Response } from 'express';
import * as AdmZip from 'adm-zip';

@Injectable()
export class FileSystemService {
  uploadPath = join(__dirname, '..', '..', '..', '..', 'clients');
  constructor(
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}
  async saveStaticFiles(files: MFile[], folder = 'default') {
    const uploadFolder = this.fileSystemHelpersService.getFullPath(
      'static',
      folder,
    );
    return this.fileSystemHelpersService.saveFiles(
      files,
      uploadFolder,
      join('static', folder),
    );
  }

  async saveUserFiles(files: MFile[], path: string) {
    const uploadFolder = this.fileSystemHelpersService.getFullPath(path);

    const saved = await this.fileSystemHelpersService.saveFiles(
      files,
      uploadFolder,
      path,
    );
    const withSizes: SaveFileResponse[] = await Promise.all(
      saved.map(async (file) => {
        const filePath = this.fileSystemHelpersService.getFullPath(file.url);
        const size = await this.fileSystemHelpersService.getFileSize(filePath);
        return new SaveFileResponse(file.url, file.name, size);
      }),
    );
    return withSizes;
  }

  async removeFolders(paths: string[]) {
    const badTries: BadTry[] = [];
    await Promise.allSettled(
      paths.map(async (path) => {
        try {
          const rmPath = this.fileSystemHelpersService.getFullPath(path);
          if (existsSync(rmPath)) {
            await rmdir(rmPath);
          }
        } catch (e: unknown) {
          const message = `Ошибка при удалени папки по пути: ${path}`;
          badTries.push(new BadTry(path, message));
        }
      }),
    );
    return badTries;
  }

  async removeFiles(paths: string[]) {
    const badTries: BadTry[] = [];
    await Promise.allSettled(
      paths.map(async (path) => {
        try {
          const rmPath = this.fileSystemHelpersService.getFullPath(path);
          if (existsSync(rmPath)) {
            await rm(rmPath);
          }
        } catch (e: unknown) {
          const message = `Ошибка при удалени файла по пути: ${path}`;
          badTries.push(new BadTry(path, message));
        }
      }),
    );
    return badTries;
  }

  async createFolder(userId: number, folderName: string, path = '') {
    const uploadPath =
      path != ''
        ? this.fileSystemHelpersService.getFullPath(path, folderName)
        : join(this.uploadPath, `${userId}`, folderName);

    if (existsSync(uploadPath)) {
      throw new BadRequestException(DUPLICATE_FOLDER_NAME);
    }
    await mkdir(uploadPath, {
      recursive: true,
    });
    return path != ''
      ? join(path, folderName)
      : join('clients', `${userId}`, folderName);
  }

  async download(path: string, res: Response): Promise<StreamableFile> {
    if (!existsSync(path)) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    const fullpath = this.fileSystemHelpersService.getFullPath(path);
    const baseName = parse(fullpath).base;
    const name = parse(fullpath).name;

    const fileInfo = await lstat(fullpath);

    if (fileInfo.isDirectory()) {
      const zip = new AdmZip();
      zip.addLocalFolder(fullpath);
      const buffer = zip.toBuffer();
      res.set({
        'Content-Disposition': `attachment; filename="${name}.zip"`,
        'Content-Type': 'application/zip',
      });
      const stream = this.fileSystemHelpersService.bufferToStream(buffer);
      return new StreamableFile(stream);
    } else {
      const file = createReadStream(fullpath);
      res.set({
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${baseName}"`,
      });
      return new StreamableFile(file);
    }
  }
}
