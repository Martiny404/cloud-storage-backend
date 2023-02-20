import { Base } from 'src/common/classes/base-entity';
import { Folder } from 'src/modules/folder/entities/folder.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class File extends Base {
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

  @Column({ type: 'float4' })
  size: number;

  @ManyToOne(() => Folder, (folder) => folder.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'folder_id' })
  folder: Folder;
}
