import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';
import { User } from 'src/auth/entities/user.entity';

@Entity('ThemeJudge')
export class ThemeJudge {
  @PrimaryColumn('uuid')
  theme_id: string;

  @PrimaryColumn('uuid')
  user_id: string;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
