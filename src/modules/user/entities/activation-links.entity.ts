import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ActivationLink {
  @PrimaryGeneratedColumn('uuid')
  link: string;

  @ManyToOne(() => User, (user) => user.links, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
