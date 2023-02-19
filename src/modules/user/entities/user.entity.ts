import { Base } from 'src/common/classes/base-entity';
import { Folder } from 'src/modules/folder/entities/folder.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { ActivationLink } from './activation-links.entity';

@Entity({ name: 'user_main' })
export class User extends Base {
  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', unique: true, name: 'nick_name' })
  nickName: string;

  @Column({ type: 'boolean', name: 'is_activated', default: false })
  isActivated: boolean;

  @ManyToMany(() => Role, (role) => role.users, {
    eager: true,
    onDelete: 'CASCADE',
  })
  roles: Role[];

  @OneToMany(() => ActivationLink, (links) => links.user)
  links: ActivationLink[];

  @OneToMany(() => Folder, (folder) => folder.user)
  folders: Folder[];
}
