import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { access, mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { FileResponse } from './file-response.class';
import * as sharp from 'sharp';
import { MFile } from './mfile.class';
import { v4 } from 'uuid';
import { BadTry } from './bad-try.class';

@Injectable()
export class FileService {
  async saveFiles(files: MFile[], folder = 'default') {
    const uploadFolder = join(__dirname, '..', '..', 'static', folder);

    try {
      await access(uploadFolder);
    } catch (e) {
      await mkdir(uploadFolder, { recursive: true });
    }

    const res: FileResponse[] = await Promise.all(
      files.map(async (file): Promise<FileResponse> => {
        try {
          await writeFile(join(uploadFolder, file.originalname), file.buffer);
        } catch (e) {
          throw new InternalServerErrorException('Ошибка при записи файлов');
        }

        return new FileResponse(
          `/static/${folder}/${file.originalname}`,
          file.originalname,
        );
      }),
    );
    return res;
  }

  convertToWebP(file: Buffer): Promise<Buffer> {
    return sharp(file).webp().toBuffer();
  }

  async removeFiles(paths: string[]) {
    const badTries: BadTry[] = [];
    await Promise.allSettled(
      paths.map(async (path) => {
        try {
          const rmPath = join(__dirname, '..', '..', path);
          await rm(rmPath);
        } catch (e: unknown) {
          const message = `Ошибка при удалени файла по пути: ${path}`;
          badTries.push(new BadTry(path, message));
        }
      }),
    );
    return badTries;
  }

  async filterFiles(files: MFile[]) {
    const newFiles = await Promise.all(
      files.map(async (file) => {
        const mimetype = file.mimetype;
        const currentFileType = file.mimetype.split('/')[1];
        const newName = v4();
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
