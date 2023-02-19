import { Injectable, NotFoundException } from '@nestjs/common';
import { mkdir, readdir, stat, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { basename, join } from 'path';
import { FileSystemResponse } from '../classes/file-response.class';
import { MFile } from '../classes/mfile.class';
import { FILE_NOT_FOUND } from 'src/common/constants/errors/file-system.errors';
import * as sharp from 'sharp';

@Injectable()
export class FileSystemHelpersService {
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

  getBaseName(path: string): string {
    if (!existsSync(path)) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    const baseName = basename(path);

    return baseName;
  }

  async getFileSize(path: string) {
    const { size } = await stat(path);

    return size / 1_000_000;
  }

  async getFolderSize(dir: string) {
    const files = await readdir(dir, { withFileTypes: true });

    const sizesArr = files.map(async (file): Promise<number> => {
      const path = join(dir, file.name);

      if (file.isDirectory()) return await this.getFolderSize(path);

      if (file.isFile()) {
        return this.getFileSize(path);
      }

      return 0;
    });

    return (await Promise.all(sizesArr))
      .flat(Infinity)
      .reduce((i, size) => i + size, 0);
  }

  getFullPath(...path: string[]) {
    const full = join(__dirname, '..', '..', '..', '..', ...path);
    return full;
  }

  convertToWebP(file: Buffer): Promise<Buffer> {
    return sharp(file).webp().toBuffer();
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
}
