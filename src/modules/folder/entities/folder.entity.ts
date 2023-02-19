import { Base } from 'src/common/classes/base-entity';
import { File } from 'src/modules/file/entities/file.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Tree('materialized-path')
@Entity()
export class Folder extends Base {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  path: string;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Folder;

  @TreeChildren()
  children: Folder[];

  @ManyToOne(() => User, (user) => user.folders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => File, (file) => file.folder)
  files: File[];
}
