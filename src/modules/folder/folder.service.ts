import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(Folder)
    private readonly folderRepository: Repository<Folder>,
  ) {}

  async createFolder(name: string, parentId?: number) {
    const folder = this.folderRepository.create({
      name,
      parent: {
        id: parentId,
      },
    });
    return this.folderRepository.save(folder);
  }

  async getById(id: number) {
    const folder = await this.folderRepository.findOne({
      where: {
        id,
      },
      relations: {
        children: true,
      },
    });
    return folder;
  }
}
