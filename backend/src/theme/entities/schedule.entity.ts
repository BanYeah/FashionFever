import { Entity, PrimaryColumn, Column, OneToOne } from 'typeorm';
import { Banner } from './banner.entity';
import { Header } from './header.entity';

@Entity('Schedule')
export class Schedule {
  @PrimaryColumn('uuid')
  theme_id: string;

  @Column({ type: 'timestamptz' })
  enroll_start_at: Date;

  @Column({ type: 'timestamptz' })
  enroll_end_at: Date;

  @Column({ type: 'timestamptz' })
  review_start_at: Date;

  @Column({ type: 'timestamptz' })
  review_end_at: Date;

  @Column({ type: 'timestamptz' })
  vote_start_at: Date;

  @Column({ type: 'timestamptz' })
  vote_end_at: Date;

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'PREPARING, ENROLLING, REVIEWING, VOTING, COMPLETE',
  })
  status: string;

  @OneToOne(() => Banner, (banner) => banner.schedule)
  banner: Banner;

  @OneToOne(() => Header, (header) => header.schedule)
  header: Header;
}
