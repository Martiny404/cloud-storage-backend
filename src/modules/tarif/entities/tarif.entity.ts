import { Base } from 'src/common/classes/base-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Subscription } from './subscription.entity';

@Entity()
export class Tarif extends Base {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'smallint', name: 'monthly_price' })
  monthlyPrice: number;

  @Column({ type: 'int' })
  disk: number;

  @OneToMany(() => Subscription, (sub) => sub.tarif)
  subscriptions: Subscription[];
}
