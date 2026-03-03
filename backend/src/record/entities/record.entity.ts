import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Schedule } from 'src/theme/entities/schedule.entity';
import { Submission } from 'src/submission/entities/submission.entity';

@Entity('Record')
export class Record {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  record_id: string;

  @Column({ type: 'uuid' })
  theme_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'bigint' })
  best_sub_id: string;

  @Column({ type: 'integer', default: null, nullable: true })
  best_final_rank: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  best_total_score: number;

  @Column({ type: 'integer', default: null, nullable: true })
  user_rank: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  best_final_score: number;

  @Column({ type: 'timestamptz', default: null, nullable: true })
  delivered_at: Date | null;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'best_sub_id' })
  submission: Submission;
}
