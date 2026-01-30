import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('Header')
export class Header {
  @PrimaryColumn('uuid')
  theme_id: string;

  @Column('text')
  name: string;

  @Column('text')
  desc: string;

  @Column({ type: 'integer', nullable: true })
  bg_limit: number;

  @OneToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;
}
