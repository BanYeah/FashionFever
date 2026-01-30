import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Schedule } from './schedule.entity';

@Entity('Banner')
export class Banner {
  @PrimaryColumn('uuid')
  theme_id: string;

  @Column('text')
  banner_url: string;

  @OneToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;
}
