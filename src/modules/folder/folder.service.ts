import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DUPLICATE_FOLDER_NAME,
  FOLDER_NOT_FOUND,
} from 'src/common/constants/errors/file-system.errors';
import { FindOneOptions, In, Not, Repository } from 'typeorm';
import { FileSystemService } from '../file-system/file-system.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { Folder } from './entities/folder.entity';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
    private readonly fileSystemService: FileSystemService,
  ) {}

  async createFolder({ name, parentId }: CreateFolderDto, userId: number) {
    let parentPath = '';

    if (parentId) {
      const parent = await this.findFolderBy({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(FOLDER_NOT_FOUND);
      }
      if (parent.name == name) {
        throw new BadRequestException(DUPLICATE_FOLDER_NAME);
      }
      parentPath = parent.path;
    }

    const path = await this.fileSystemService.createFolder(
      userId,
      name,
      parentPath,
    );

    const folder = this.folderRepository.create({
      name,
      path,
      parent: {
        id: parentId ?? null,
      },
      user: {
        id: userId,
      },
    });
    return this.folderRepository.save(folder);
  }

  async findFolderBy(options: FindOneOptions<Folder>) {
    const folder = await this.folderRepository.findOne(options);
    return folder;
  }

  async removeFolders(ids: number[], userId: number) {
    const folders = await this.folderRepository.find({
      where: {
        id: In(ids),
        parent: {
          id: Not(0),
        },
        user: { id: userId },
      },
    });
    const paths = folders.map((f) => f.path);
    const badTries = await this.fileSystemService.removeFolders(paths);
    const badPaths = badTries.map((t) => t.path);
    const filteredFolders = folders.filter(
      (folder) => !badPaths.includes(folder.path),
    );
    await this.folderRepository.remove(filteredFolders);
    return badTries;
  }
}
