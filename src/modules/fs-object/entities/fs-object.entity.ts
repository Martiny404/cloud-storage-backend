import { Base } from 'src/common/classes/base-entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

export enum FileTypeEnum {
  FOLDER = 'folder',
  FILE = 'file',
}
@Tree('materialized-path')
@Entity()
export class FsObject extends Base {
  @Column({ type: 'varchar' })
  path: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({
    type: 'varchar',
    name: 'public_link',
    nullable: true,
    unique: true,
  })
  publicLink: string;

  @Column({ type: 'enum', enum: FileTypeEnum, name: 'file_type' })
  fileType: FileTypeEnum;

  @Column({ type: 'float4', nullable: true })
  size: number;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: FsObject;

  @TreeChildren()
  children: FsObject[];

  @OneToOne(() => User, (user) => user.rootFolder)
  rootUser: User;

  @Column({ type: 'varchar', nullable: true })
  mimetype: string;

  @ManyToOne(() => User, (user) => user.fsObjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
