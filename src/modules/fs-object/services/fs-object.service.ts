import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DUPLICATE_FOLDER_NAME,
  FILE_NOT_FOUND,
  FOLDER_NOT_FOUND,
} from 'src/common/constants/errors/file-system.errors';
import { BadTry } from 'src/modules/file-system/classes/bad-try.class';
import { MFile } from 'src/modules/file-system/classes/mfile.class';
import { FileSystemHelpersService } from 'src/modules/file-system/services/file-system-helpers.service';
import { FileSystemService } from 'src/modules/file-system/services/file-system.service';
import { Repository, FindOneOptions, In, Like, ILike, Not } from 'typeorm';
import { v4 } from 'uuid';
import { FileTypeEnum, FsObject } from '../entities/fs-object.entity';

@Injectable()
export class FsObjectService {
  constructor(
    @InjectRepository(FsObject)
    private readonly fsObjectsRepository: Repository<FsObject>,
    private readonly fileSystemService: FileSystemService,
    private readonly fileSystemHelpersService: FileSystemHelpersService,
  ) {}

  async findObjects(ids: number[], userId: number) {
    const files = await this.fsObjectsRepository.find({
      where: {
        id: In(ids),
        user: { id: userId },
      },
    });

    if (files.length == 0) {
      throw new NotFoundException(FOLDER_NOT_FOUND);
    }
    return files;
  }

  async findFileByUser(id: number, userId: number) {
    const file = await this.getFile({
      where: {
        id,
        user: { id: userId },
      },
    });
    if (!file) {
      throw new NotFoundException(FILE_NOT_FOUND);
    }
    return file;
  }

  async getFile(options: FindOneOptions<FsObject>) {
    const file = await this.fsObjectsRepository.findOne(options);
    return file;
  }

  async removePublicLink(id: number, userId: number) {
    const file = await this.findFileByUser(id, userId);
    file.publicLink = null;
    return this.fsObjectsRepository.save(file);
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
    return this.fsObjectsRepository.save(file);
  }

  async rename(id: number, newName: string) {
    const file = await this.getFile({
      where: { id },
    });

    const oldPath = file.path;

    const newData = await this.fileSystemHelpersService.rename(
      file.path,
      newName,
    );
    file.name = newData.name;
    file.path = newData.path;
    await this.fsObjectsRepository.save(file);
    const childFiles = await this.fsObjectsRepository.find({
      where: {
        path: Like(`${oldPath}%`),
        id: Not(file.id),
      },
    });
    if (childFiles.length > 0) {
      await Promise.all(
        childFiles.map(async (fl) => {
          const newPath = fl.path.replace(oldPath, file.path);
          fl.path = newPath;
          await this.fsObjectsRepository.save(fl);
        }),
      );
    }
    return file;
  }

  async createFolder(name: string, userId: number, parentId?: number) {
    let parentPath = '';

    if (parentId) {
      const parent = await this.getFile({
        where: { id: parentId },
        relations: { children: true },
      });
      if (!parent) {
        throw new NotFoundException(FOLDER_NOT_FOUND);
      }

      if (parent.name == name) {
        throw new BadRequestException(DUPLICATE_FOLDER_NAME);
      }
      parentPath = parent.path;
    }

    const { path, folderName } = await this.fileSystemService.createFolder(
      userId,
      name,
      parentPath,
    );

    const folder = this.fsObjectsRepository.create({
      name: folderName,
      path,
      parent: {
        id: parentId ?? null,
      },
      user: {
        id: userId,
      },
      fileType: FileTypeEnum.FOLDER,
    });
    return await this.fsObjectsRepository.save(folder);
  }

  async createFile(file: MFile, folderId: number, userId: number) {
    const parent = await this.getFile({
      where: {
        id: folderId,
        fileType: FileTypeEnum.FOLDER,
        user: { id: userId },
      },
    });

    const compressedFiles = await this.fileSystemHelpersService.filterFile(
      file,
    );
    const savedFile = await this.fileSystemService.saveUserFile(
      compressedFiles,
      parent.path,
    );

    const newFile = this.fsObjectsRepository.create({
      parent: { id: parent.id },
      name: savedFile.name,
      path: savedFile.url,
      size: savedFile.size,
      mimetype: savedFile.mimetype,
      fileType: FileTypeEnum.FILE,
      user: { id: userId },
    });

    return this.fsObjectsRepository.save(newFile);
  }

  async removeObjects(ids: number[], userId: number, parentId: number) {
    const files = await this.fsObjectsRepository.find({
      where: {
        id: In(ids),
        parent: {
          id: parentId,
        },
        user: { id: userId },
      },
    });
    const filesPaths: string[] = [];
    const foldersPaths: string[] = [];

    files.forEach((file) => {
      if (file.fileType == FileTypeEnum.FILE) {
        filesPaths.push(file.path);
      } else {
        foldersPaths.push(file.path);
      }
    });

    const badFilesTries: BadTry[] = await this.fileSystemService.removeFiles(
      filesPaths,
    );
    const badFoldersTries = this.fileSystemService.removeFolders(foldersPaths);

    const badTries = [...badFilesTries, ...badFoldersTries];

    const badPaths = badTries.map((t) => t.path);
    const filteredFiles = files.filter((file) => !badPaths.includes(file.path));

    await this.fsObjectsRepository.remove(filteredFiles);
    return badTries;
  }
}
