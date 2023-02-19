import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { mkdir, writeFile, rm, rmdir } from 'fs/promises';
import { join, basename } from 'path';
import { FileSystemResponse } from './file-response.class';
import * as sharp from 'sharp';
import { MFile } from './mfile.class';
import { BadTry } from './bad-try.class';
import { existsSync } from 'fs';
import {
  DUPLICATE_FOLDER_NAME,
  FILE_NOT_FOUND,
} from 'src/common/constants/errors/file-system.errors';

@Injectable()
export class FileSystemService {
  async saveStaticFiles(files: MFile[], folder = 'default') {
    const uploadFolder = join(__dirname, '..', '..', '..', 'static', folder);
    return this.saveFiles(files, uploadFolder, join('static', folder));
  }

  async saveFiles(files: MFile[], uploadPath: string, path: string) {
    if (existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }

    const res: FileSystemResponse[] = [];

    await Promise.allSettled(
      files.map(async (file) => {
        await writeFile(join(uploadPath, file.originalname), file.buffer);
        res.push(
          new FileSystemResponse(
            join(path, file.originalname),
            file.originalname,
          ),
        );
      }),
    );
    return res;
  }

  async saveUserFiles(files: MFile[], path: string) {
    const uploadFolder = join(__dirname, '..', '..', '..', path);

    return this.saveFiles(files, uploadFolder, path);
  }

  convertToWebP(file: Buffer): Promise<Buffer> {
    return sharp(file).webp().toBuffer();
  }

  async removeFolders(paths: string[]) {
    const badTries: BadTry[] = [];
    await Promise.allSettled(
      paths.map(async (path) => {
        try {
          const rmPath = join(__dirname, '..', '..', '..', path);
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
          const rmPath = join(__dirname, '..', '..', '..', path);
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
        ? join(__dirname, '..', '..', '..', path, folderName)
        : join(__dirname, '..', '..', '..', 'clients', `${userId}`, folderName);

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

  async filterFiles(files: MFile[]) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const mimetype = file.mimetype;
        const currentFileType = file.mimetype.split('/')[1];
        const newName = file.originalname.split('.')[0];
        const type = file.originalname.split('.')[1];

        if (mimetype.includes('image')) {
          if (currentFileType != 'svg+xml') {
            const buffer = await this.convertToWebP(file.buffer);
            return new MFile({
              buffer,
              originalname: `${newName}.webp`,
              mimetype,
            });
          }
          return new MFile({
            buffer: file.buffer,
            originalname: `${newName}.svg`,
            mimetype,
          });
        }
        return new MFile({
          buffer: file.buffer,
          originalname: `${newName}.${type}`,
          mimetype,
        });
      }),
    );
    return newFiles;
  }

  getBaseName(path: string): string {
    if (!existsSync(path)) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    const baseName = basename(path);

    return baseName;
  }

  //async checkFolderOrFileAccess(path: string, userId: number) {}
}
