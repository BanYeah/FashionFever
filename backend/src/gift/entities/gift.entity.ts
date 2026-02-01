import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GiftCollection } from './gift-collection.entity';

@Entity('Gift')
export class Gift {
  @PrimaryColumn({ type: 'bigint' })
  gift_id: string;

  @Column({ type: 'bigint' })
  gift_collection_id: string;

  @Column('text')
  theme_name: string;

  @Column('text')
  gift_name: string;

  @Column('text')
  gift_url: string;

  @Column('integer')
  collection_order: number;

  @ManyToOne(() => GiftCollection, (collection) => collection.gifts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'gift_collection_id' })
  giftCollection: GiftCollection;
}
