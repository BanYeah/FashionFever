import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { Judge } from './judge.entity';

@Entity('User')
export class User {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 7, unique: true })
  minicode: string;

  @Column({ type: 'text' })
  enter_code: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToOne(() => Judge, (judge) => judge.user)
  judge: Judge;
}
