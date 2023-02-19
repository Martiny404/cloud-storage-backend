import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FOLDER_NOT_FOUND } from 'src/common/constants/errors/file-system.errors';
import { In, Repository } from 'typeorm';
import { FileSystemService } from '../file-system/file-system.service';
import { MFile } from '../file-system/mfile.class';
import { FolderService } from '../folder/folder.service';
import { File } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>,
    private readonly fileSystemService: FileSystemService,
    private readonly folderService: FolderService,
  ) {}
  async createFile(files: MFile[], folderId: number, userId: number) {
    const folder = await this.folderService.findFolderBy({
      where: { id: folderId, user: { id: userId } },
    });
    if (!folder) {
      throw new NotFoundException(FOLDER_NOT_FOUND);
    }
    const compressedFiles = await this.fileSystemService.filterFiles(files);
    const savedFiles = await this.fileSystemService.saveUserFiles(
      compressedFiles,
      folder.path,
    );
    const newFiles = savedFiles.map((file) => {
      const newFile = this.fileRepository.create({
        folder: { id: folder.id },
        name: file.name,
        path: file.url,
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
}
