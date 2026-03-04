import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { User } from 'src/auth/entities/user.entity';
import { Schedule } from 'src/theme/entities/schedule.entity';

@Entity('VoteStat')
export class VoteStat {
  @PrimaryColumn({ type: 'uuid' })
  theme_id: string;

  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'integer', default: 0 })
  vote_count: number;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
