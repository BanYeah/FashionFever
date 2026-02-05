import { Entity, PrimaryColumn, Generated, Column, OneToOne } from 'typeorm';
import { Banner } from './banner.entity';
import { Header } from './header.entity';
import { Reviewer } from './reviewer.entity';

@Entity('Schedule')
export class Schedule {
  @PrimaryColumn('uuid')
  @Generated('uuid')
  theme_id: string;

  @Column({ type: 'timestamptz' })
  enroll_start_at: Date;

  @Column({ type: 'timestamptz' })
  review_start_at: Date;

  @Column({ type: 'timestamptz' })
  vote_start_at: Date;

  @Column({ type: 'timestamptz' })
  result_start_at: Date;

  @Column({
    type: 'varchar',
    length: 10,
    comment: 'PREPARING, ENROLLING, REVIEWING, VOTING, RESULTING, COMPLETE',
  })
  status: string;

  @OneToOne(() => Banner, (banner) => banner.schedule)
  banner: Banner;

  @OneToOne(() => Header, (header) => header.schedule)
  header: Header;

  @OneToOne(() => Reviewer, (reviewer) => reviewer.schedule)
  reviewer: Reviewer;
}
