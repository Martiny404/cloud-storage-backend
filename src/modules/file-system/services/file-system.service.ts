import {
  BadRequestException,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { mkdir, rm } from 'fs/promises';
import { join, parse } from 'path';
import { MFile } from '../classes/mfile.class';
import { BadTry } from '../classes/bad-try.class';
import { existsSync, lstatSync } from 'fs';
import { DUPLICATE_FOLDER_NAME } from 'src/common/constants/errors/file-system.errors';
import { SaveFileResponse } from '../classes/save-file-response.class';
import { Response } from 'express';
import * as AdmZip from 'adm-zip';
import { FsObject } from 'src/modules/fs-object/entities/fs-object.entity';
import { v4 } from 'uuid';
import { FileSystemHelpersService } from './file-system-helpers.service';
import { BufferStream } from 'src/common/classes/buffer-stream.class';

@Injectable()
export class FileSystemService {
  uploadPath = join(process.cwd(), 'clients');
  constructor(
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}
  async saveStaticFiles(file: MFile, folder = 'default') {
    const uploadFolder = this.fileSystemHelpersService.getFullPath(
      'static',
      folder,
    );
    return this.fileSystemHelpersService.saveFile(
      file,
      uploadFolder,
      join('static', folder),
    );
  }

  async checkFilesExist(fsObjects: FsObject[]) {
    return fsObjects.filter(
      (obj) => !existsSync(this.fileSystemHelpersService.getFullPath(obj.path)),
    );
  }

  async saveUserFile(file: MFile, path: string) {
    const uploadFolder = this.fileSystemHelpersService.getFullPath(path);

    const saved = await this.fileSystemHelpersService.saveFile(
      file,
      uploadFolder,
      path,
    );

    const filePath = this.fileSystemHelpersService.getFullPath(saved.url);
    const size = await this.fileSystemHelpersService.getFileSize(filePath);
    return new SaveFileResponse(saved.url, saved.name, size);
  }

  removeFolders(paths: string[]) {
    const badTries: BadTry[] = [];
    paths.forEach((path) => {
      try {
        const rmPath = this.fileSystemHelpersService.getFullPath(path);
        if (existsSync(rmPath)) {
          this.fileSystemHelpersService.recursiveRmDir(rmPath);
        }
      } catch (e: unknown) {
        const message = `Ошибка при удалени папки по пути: ${path}`;
        badTries.push(new BadTry(path, message));
      }
    });

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
    let name = folderName;
    let uploadPath =
      path != ''
        ? this.fileSystemHelpersService.getFullPath(path, name)
        : join(this.uploadPath, `${userId}`, name);

    if (existsSync(uploadPath)) {
      const dir = parse(uploadPath).dir;
      const newName = `${name}-${v4()}`;
      uploadPath = join(dir, newName);
      name = newName;
    }
    await mkdir(uploadPath);
    return path != ''
      ? { path: join(path, name), folderName: name }
      : { path: join('clients', `${userId}`, name), folderName: name };
  }

  download(objects: FsObject[], res: Response): StreamableFile {
    const zip = new AdmZip();

    objects.forEach((obj) => {
      const fullpath = this.fileSystemHelpersService.getFullPath(obj.path);
      if (existsSync(fullpath)) {
        const info = lstatSync(fullpath);
        if (info.isDirectory()) {
          zip.addLocalFolder(fullpath);
        } else {
          zip.addLocalFile(fullpath);
        }
      }
    });
    const name = v4();
    const buffer = zip.toBuffer();
    res.set({
      'Content-Disposition': `attachment; filename="${name}.zip"`,
      'Content-Type': 'application/zip',
    });
    const stream = new BufferStream(buffer);
    return new StreamableFile(stream);
  }
}
