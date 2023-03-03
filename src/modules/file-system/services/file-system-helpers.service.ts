import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { readdir, stat, rename } from 'fs/promises';
import {
  createWriteStream,
  existsSync,
  lstatSync,
  readdirSync,
  rmdirSync,
  unlinkSync,
} from 'fs';
import { join, parse } from 'path';
import { FileSystemResponse } from '../classes/file-response.class';
import { MFile } from '../classes/mfile.class';
import * as sharp from 'sharp';
import { v4 } from 'uuid';
import { BufferStream } from 'src/common/classes/buffer-stream.class';
import { pipeline } from 'stream/promises';

@Injectable()
export class FileSystemHelpersService {
  async saveFile(file: MFile, uploadPath: string, path: string) {
    if (!existsSync(uploadPath)) {
      throw new NotFoundException('Путь не найден!');
    }
    const fullname = Buffer.from(file.originalname, 'latin1').toString('utf-8');
    const ext = parse(fullname).ext;
    const name = parse(fullname).name;
    const newName = `${name}-${v4()}${ext}`;
    const newFilePath = join(uploadPath, newName);
    if (existsSync(newFilePath)) {
      throw new BadRequestException('Файл уже существует!');
    }

    //await writeFile(newFilePath, file.buffer);
    const rs = new BufferStream(file.buffer);
    const ws = createWriteStream(newFilePath);
    await pipeline(rs, ws);
    return new FileSystemResponse(join(path, newName), newName);
  }

  async getFileSize(path: string) {
    const { size } = await stat(path);
    return size / 1_000_000;
  }

  recursiveRmDir(path: string) {
    if (existsSync(path)) {
      readdirSync(path).forEach((file) => {
        const curPath = join(path, file);
        if (lstatSync(curPath).isDirectory()) {
          this.recursiveRmDir(curPath);
        } else {
          unlinkSync(curPath);
        }
      });
      rmdirSync(path);
    }
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
    const full = join(process.cwd(), ...path);
    return full;
  }

  convertToWebP(file: Buffer): Promise<Buffer> {
    return sharp(file).webp().toBuffer();
  }

  async filterFile(file: MFile) {
    const mimetype = file.mimetype;
    const currentFileType = file.mimetype.split('/')[1];
    const newName = file.originalname.split('.')[0];
    const type = file.originalname.split('.')[1];
    const size = file.size;
    if (mimetype.includes('image')) {
      if (currentFileType != 'svg+xml') {
        const buffer = await this.convertToWebP(file.buffer);
        return new MFile({
          buffer,
          originalname: `${newName}.webp`,
          mimetype,
          size,
        });
      }
      return new MFile({
        buffer: file.buffer,
        originalname: `${newName}.svg`,
        mimetype,
        size,
      });
    }
    return new MFile({
      buffer: file.buffer,
      originalname: `${newName}.${type}`,
      mimetype,
      size,
    });
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
}
