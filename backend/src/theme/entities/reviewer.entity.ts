import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Schedule } from './schedule.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('Reviewer')
export class Reviewer {
  @PrimaryColumn('uuid')
  theme_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @OneToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
