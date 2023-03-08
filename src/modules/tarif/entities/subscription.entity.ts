import { User } from 'src/modules/user/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tarif } from './tarif.entity';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tarif, (tarif) => tarif.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tarif_id' })
  tarif: Tarif;

  @ManyToOne(() => User, (user) => user.subscriptions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'bool', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'smallint' })
  monthes: number;

  @Column({ type: 'timestamp', name: 'end_date', nullable: true })
  endDate: Date;

  @CreateDateColumn({ name: 'start_date' })
  startDate: Date;

  @BeforeInsert()
  setEndDate() {
    const date = new Date();
    //date.setMonth(date.getMonth() + this.monthes);
    date.setSeconds(date.getSeconds() + this.monthes);
    this.endDate = date;
  }
}
