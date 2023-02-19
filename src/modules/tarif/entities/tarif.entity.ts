import { Base } from 'src/common/classes/base-entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Tarif extends Base {
  @Column({ type: 'smallint' })
  price: number;

  @Column({ type: 'smallint' })
  disk: number;
}
