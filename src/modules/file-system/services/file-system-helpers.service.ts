import { Injectable } from '@nestjs/common';
import { mkdir, readdir, readFile, stat, writeFile, rename } from 'fs/promises';
import { existsSync } from 'fs';
import { join, parse } from 'path';
import { FileSystemResponse } from '../classes/file-response.class';
import { MFile } from '../classes/mfile.class';
import * as sharp from 'sharp';
import { File } from 'src/modules/file/entities/file.entity';
import { Duplex } from 'stream';

@Injectable()
export class FileSystemHelpersService {
  async saveFiles(files: MFile[], uploadPath: string, path: string) {
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true });
    }
    const res: FileSystemResponse[] = [];

    await Promise.allSettled(
      files.map(async (file) => {
        try {
          await writeFile(join(uploadPath, file.originalname), file.buffer);
          res.push(
            new FileSystemResponse(
              join(path, file.originalname),
              file.originalname,
            ),
          );
        } catch (e) {
          console.log(e);
        }
      }),
    );
    return res;
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

  async serveFile(file: File) {
    const filePath = this.getFullPath(file.path);
    const response = await readFile(filePath);
    return response;
  }

  async rename(filePath: string, newName: string) {
    const dir = parse(filePath).dir;
    const ext = parse(filePath).ext;
    const oldFullPath = this.getFullPath(filePath);
    const newFullPath = this.getFullPath(dir, `${newName}${ext}`);
    await rename(oldFullPath, newFullPath);
    return {
      path: join(dir, `${newName}${ext}`),
      name: `${newName}${ext}`,
    };
  }

  bufferToStream(buffer: Buffer) {
    const tmp = new Duplex();
    tmp.push(buffer);
    tmp.push(null);
    return tmp;
  }
}
