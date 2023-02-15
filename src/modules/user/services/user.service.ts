import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { roleNotFound } from 'src/common/constants/errors/role.errors';
import {
  USER_HAS_ROLE,
  USER_NOT_FOUND,
} from 'src/common/constants/errors/user.errors';
import { ROLE_NOT_FOUND } from 'src/common/constants/errors/role.errors';
import { RoleService } from 'src/modules/role/role.service';
import { DeepPartial, FindOneOptions, Repository, SaveOptions } from 'typeorm';
import { ActivationLink } from '../entities/activation-links.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ActivationLink)
    private readonly linkRepository: Repository<ActivationLink>,

    private readonly roleService: RoleService,
  ) {}

  async createUser(dto: DeepPartial<User>): Promise<User> {
    const userRole = await this.roleService.findRoleByTitle('USER');
    if (!userRole) {
      throw new NotFoundException(roleNotFound('USER'));
    }
    const user = this.userRepository.create({ ...dto, roles: [userRole] });
    await this.saveUser(user);
    return user;
  }

  async addLink(userId: number) {
    const newLink = this.linkRepository.create({
      user: {
        id: userId,
      },
    });
    return await this.linkRepository.save(newLink);
  }

  async update(id: number, nickName: string) {
    const user = await this.findOneBy({ where: { id } });
    user.nickName = nickName;
    await this.saveUser(user);
  }

  async findOneBy(options: FindOneOptions<User>): Promise<User> {
    const user = await this.userRepository.findOne(options);
    return user;
  }

  async saveUser(entity: User, options?: SaveOptions): Promise<User> {
    return await this.userRepository.save(entity, options);
  }

  async activateUser(activationLink: string): Promise<boolean> {
    const link = await this.linkRepository.findOne({
      where: {
        link: activationLink,
      },
    });
    if (!link) {
      throw new NotFoundException('Ссылка не найдена!');
    }
    const user = await this.findOneBy({ where: { id: link.user.id } });
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    user.isActivated = true;
    await this.saveUser(user);
    this.linkRepository.remove(link);
    return true;
  }

  async addRole(userId: number, roleId: number): Promise<boolean> {
    const user = await this.findOneBy({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(USER_NOT_FOUND);
    }
    const role = await this.roleService.findRoleById(roleId);
    if (!role) {
      throw new NotFoundException(ROLE_NOT_FOUND);
    }
    const isUserHasRole = user.roles.find((userRole) => userRole.id == role.id);

    if (isUserHasRole) {
      throw new BadRequestException(USER_HAS_ROLE);
    }

    user.roles = [...user.roles, role];
    await this.saveUser(user);
    return true;
  }
}
