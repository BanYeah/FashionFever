import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Schedule } from 'src/theme/entities/schedule.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('Submission')
export class Submission {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  submission_id: string;

  @Column({ type: 'uuid' })
  theme_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string | null;

  @Column({ type: 'text', nullable: true })
  content_url: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'boolean', default: null, nullable: true })
  is_approved: boolean | null;

  @Column({ type: 'timestamptz', default: null, nullable: true })
  reviewed_at: Date | null;

  @Column({ type: 'integer', default: null, nullable: true })
  vote_rank: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  vote_score: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  judge_score: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  like_score: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  total_score: number;

  @Column({ type: 'integer', default: null, nullable: true })
  final_rank: number | null;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  adj_score: number;

  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0.0,
  })
  final_score: number;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  theme: Schedule;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
