import { Base } from 'src/common/classes/base-entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Tarif } from './tarif.entity';

@Entity()
export class UserTarifs extends Base {
  @ManyToOne(() => Tarif, (tarif) => tarif.usersTarifs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tarif_id' })
  tarif: Tarif;

  @ManyToOne(() => User, (user) => user.usersTarifs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
