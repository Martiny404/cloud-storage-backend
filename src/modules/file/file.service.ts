import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FILE_NOT_FOUND,
  FOLDER_NOT_FOUND,
} from 'src/common/constants/errors/file-system.errors';
import { FindOneOptions, In, Repository } from 'typeorm';
import { FileSystemService } from '../file-system/services/file-system.service';
import { MFile } from 'src/modules/file-system/classes/mfile.class';
import { FolderService } from '../folder/folder.service';
import { File } from './entities/file.entity';
import { FileSystemHelpersService } from '../file-system/services/file-system-helpers.service';
import { v4 } from 'uuid';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    private readonly fileSystemService: FileSystemService,
    private readonly folderService: FolderService,
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}
  async createFile(files: MFile[], folderId: number, userId: number) {
    const folder = await this.folderService.findFolderBy({
      where: { id: folderId, user: { id: userId } },
    });
    if (!folder) {
      throw new NotFoundException(FOLDER_NOT_FOUND);
    }
    const compressedFiles = await this.fileSystemHelpersService.filterFiles(
      files,
    );
    const savedFiles = await this.fileSystemService.saveUserFiles(
      compressedFiles,
      folder.path,
    );
    const newFiles = savedFiles.map((file) => {
      const newFile = this.fileRepository.create({
        folder: { id: folder.id },
        name: file.name,
        path: file.url,
        size: file.size,
      });
      return newFile;
    });

    return this.fileRepository.save(newFiles);
  }

  async removeFiles(ids: number[], userId: number) {
    const files = await this.fileRepository.find({
      where: {
        id: In(ids),
        folder: {
          user: {
            id: userId,
          },
        },
      },
    });
    const paths = files.map((file) => file.path);
    const badTries = await this.fileSystemService.removeFiles(paths);
    const badPaths = badTries.map((t) => t.path);
    const filteredFiles = files.filter((file) => !badPaths.includes(file.path));
    await this.fileRepository.remove(filteredFiles);
    return badTries;
  }

  async findFileByUser(id: number, userId: number) {
    const file = await this.getFile({
      where: {
        id,
        folder: { user: { id: userId } },
      },
    });
    if (!file) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    return file;
  }

  async getFile(options: FindOneOptions<File>) {
    const file = await this.fileRepository.findOne(options);
    return file;
  }

  async removePublicLink(id: number, userId: number) {
    const file = await this.findFileByUser(id, userId);
    file.publicLink = null;
    return this.fileRepository.save(file);
  }

  async getFileByLink(link: string) {
    const file = await this.getFile({
      where: { publicLink: link },
    });
    if (!file) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    return file;
  }

  async generatePublicLink(id: number, userId: number) {
    const file = await this.findFileByUser(id, userId);
    const link = `${v4()}-${file.id}`;
    file.publicLink = link;
    return this.fileRepository.save(file);
  }
}
