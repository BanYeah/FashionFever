import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('Judge')
export class Judge {
  @PrimaryColumn('uuid')
  user_id: string;

  @Column({ type: 'varchar', length: 7, unique: true })
  minicode: string;

  @CreateDateColumn({ type: 'timestamptz' })
  appointed_at: Date;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' }) // FK
  user: User;

  @OneToOne(() => User)
  @JoinColumn({ name: 'minicode', referencedColumnName: 'minicode' }) // FK
  userByMinicode: User;
}
