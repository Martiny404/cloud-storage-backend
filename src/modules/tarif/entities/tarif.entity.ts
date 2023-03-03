import { Base } from 'src/common/classes/base-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserTarifs } from './user-tarifs.entity';

@Entity()
export class Tarif extends Base {
  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'smallint' })
  price: number;

  @Column({ type: 'int' })
  disk: number;

  @OneToMany(() => UserTarifs, (ut) => ut.tarif)
  usersTarifs: UserTarifs[];
}
