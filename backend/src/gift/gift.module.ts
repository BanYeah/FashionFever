import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiftCollection } from './entities/gift-collection.entity';
import { Gift } from './entities/gift.entity';

import { GiftController } from './gift.controller';
import { GiftService } from './gift.service';

@Module({
  imports: [TypeOrmModule.forFeature([GiftCollection, Gift])],
  controllers: [GiftController],
  providers: [GiftService],
  exports: [GiftService],
})
export class GiftModule {}
