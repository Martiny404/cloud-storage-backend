import { Base } from 'src/common/classes/base-entity';
import {
  Column,
  Entity,
  JoinColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Tree('materialized-path')
@Entity()
export class Folder extends Base {
  @Column({ name: 'varchar' })
  name: string;

  @TreeParent({ onDelete: 'CASCADE' })
  parent: Folder;

  @TreeChildren()
  children: Folder[];
}
