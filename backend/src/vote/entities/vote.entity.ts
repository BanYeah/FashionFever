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

@Entity('Vote')
export class Vote {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  vote_id: string;

  @Column({ type: 'uuid' })
  theme_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'bigint' })
  sub_id1: string;

  @Column({ type: 'bigint' })
  sub_id2: string;

  @Column({ type: 'real', default: null, nullable: true })
  sub_id1_score: number | null;

  @Column({ type: 'real', default: null, nullable: true })
  sub_id2_score: number | null;

  @Column({ type: 'real', default: null, nullable: true })
  delta: number | null;

  @Column({ type: 'bigint', default: null, nullable: true })
  win_sub_id: string | null;

  @Column({ type: 'bigint', default: null, nullable: true })
  lose_sub_id: string | null;

  @Column({ type: 'timestamptz', default: null, nullable: true })
  voted_at: Date | null;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'sub_id1' })
  submission1: Submission;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'sub_id1' })
  submission2: Submission;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'sub_id1' })
  winner: Submission;

  @ManyToOne(() => Submission)
  @JoinColumn({ name: 'sub_id1' })
  loser: Submission;
}
