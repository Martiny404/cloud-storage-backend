import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ROLE_IS_EXISTS,
  ROLE_NOT_FOUND,
} from 'src/common/constants/errors/role.errors';
import { Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}
  async create(title: string): Promise<Role> {
    const isRoleExist = await this.findRoleByTitle(title);

    if (isRoleExist) {
      throw new BadRequestException(ROLE_IS_EXISTS);
    }

    const role = this.roleRepository.create({
      title,
    });
    return this.roleRepository.save(role);
  }

  async findRoleByTitle(title: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: {
        title,
      },
    });
    return role;
  }

  async findRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: {
        id,
      },
    });
    return role;
  }

  async removeRole(id: number): Promise<boolean> {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND);
    }
    await this.roleRepository.remove(role);
    return true;
  }

  async updateRole(id: number, { title }: RoleDto): Promise<Role> {
    const role = await this.findRoleById(id);
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND);
    }
    role.title = title.toUpperCase();
    return this.roleRepository.save(role);
  }
}
