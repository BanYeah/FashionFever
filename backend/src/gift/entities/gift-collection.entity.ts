import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Schedule } from 'src/theme/entities/schedule.entity';
import { Gift } from './gift.entity';

@Entity('GiftCollection')
export class GiftCollection {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  gift_collection_id: string; // BIGSERIAL은 JS에서 string으로 처리하는 것이 안전

  @Column('uuid')
  theme_id: string;

  @Column({ type: 'numeric', precision: 3, scale: 2 })
  heart_rate: number;

  @Column('integer')
  gift_total_num: number;

  @Column('boolean')
  is_random: boolean;

  @Column({ type: 'boolean', nullable: true })
  is_same_theme: boolean | null;

  @Column({
    type: 'varchar',
    length: 6,
    nullable: true,
    comment: 'NORMAL, VIP, LUCK, CASH',
  })
  theme_type: string | null;

  @Column({
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: 'N, R, SR',
  })
  rarity: string | null;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  schedule: Schedule;

  @OneToMany(() => Gift, (gift) => gift.giftCollection)
  gifts: Gift[];
}
