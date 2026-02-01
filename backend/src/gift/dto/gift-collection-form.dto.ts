import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { GiftFormDto } from './gift-form.dto';

export class GiftCollectionFormDto {
  @ApiProperty({
    description: '하트 레이트',
    example: 5.0,
  })
  @IsNumber()
  @IsNotEmpty()
  heart_rate: number;

  @ApiProperty({
    description: '선물 컬렉션 내 선물의 수 (총합)',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  gift_total_num: number;

  @ApiProperty({
    description: '랜덤 선물 전달 여부',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_random: boolean;

  @ApiProperty({
    description: '동일 테마 여부',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is_same_theme: boolean | null;

  @ApiProperty({
    description: '테마 분류',
    example: 'NORMAL, VIP, LUCK, CASH',
  })
  @IsString()
  @IsOptional()
  theme_type: string | null;

  @ApiProperty({
    description: '선물 희귀도',
    example: 'N, R, SR',
  })
  @IsString()
  @IsOptional()
  rarity: string | null;

  @ApiProperty({ type: [GiftFormDto], description: '선물 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GiftFormDto)
  gifts: GiftFormDto[];
}
