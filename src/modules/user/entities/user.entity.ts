import { Base } from 'src/common/classes/base-entity';
import { FsObject } from 'src/modules/fs-object/entities/fs-object.entity';
import { Role } from 'src/modules/role/entities/role.entity';
import { Tarif } from 'src/modules/tarif/entities/tarif.entity';
import { UserTarifs } from 'src/modules/tarif/entities/user-tarifs.entity';
import { Column, Entity, JoinColumn, ManyToMany, OneToMany } from 'typeorm';
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

  @OneToMany(() => FsObject, (fsObject) => fsObject.user)
  @JoinColumn({ name: 'js_objects' })
  fsObjects: FsObject[];

  @OneToMany(() => UserTarifs, (ut) => ut.tarif)
  usersTarifs: UserTarifs[];
}
