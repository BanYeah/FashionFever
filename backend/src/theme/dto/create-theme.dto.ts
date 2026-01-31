import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsDate,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class CreateGiftDto {
  @ApiProperty({
    description: '테마 이름',
    example: '[VIP] 성야, 별이 내리는 거리에서',
  })
  @IsString()
  @IsNotEmpty()
  theme_name: string;

  @ApiProperty({
    description: '선물 이름',
    example: '별빛이 반짝이는 소녀 아이',
  })
  @IsString()
  @IsNotEmpty()
  gift_name: string;

  @ApiProperty({
    description: '선물 컬렉션 내 순서 (1부터 시작)',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  collection_order: number;
}

export class CreateGiftCollectionDto {
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
  is_same_theme: boolean | null;

  @ApiProperty({
    description: '테마 분류',
    example: 'NORMAL, VIP, LUCK, CASH',
  })
  @IsString()
  theme_type: string | null;

  @ApiProperty({
    description: '선물 희귀도',
    example: 'N, R, SR',
  })
  @IsString()
  rarity: string | null;

  @ApiProperty({ type: [CreateGiftDto], description: '선물 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGiftDto)
  gifts: CreateGiftDto[];
}

export class CreateThemeSettingDto {
  // Header
  @ApiProperty({
    description: '테마 이름',
    example: '두근두근 핑크빛 병원',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: '테마 설명',
    example: '블링블링 러블리한 핑크빛 병원에 어울리는 미니는 누구?',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    description: '배경색 제한 (0부터 시작)',
    example: 0,
  })
  @IsNumber()
  bg_limit: number | null;

  // Schedule
  @ApiProperty({
    description: '참가 시작 시간',
    example: '2026-01-01T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  enroll_start_at: Date;

  @ApiProperty({
    description: '참가 종료 시간',
    example: '2026-01-03T23:59:59Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  enroll_end_at: Date;

  @ApiProperty({
    description: '검수 시작 시간',
    example: '2026-01-04T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  review_start_at: Date;

  @ApiProperty({
    description: '검수 시작 시간',
    example: '2026-01-04T23:59:59Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  review_end_at: Date;

  @ApiProperty({
    description: '투표 시작 시간',
    example: '2026-01-05T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  vote_start_at: Date;

  @ApiProperty({
    description: '투표 종료 시간',
    example: '2026-01-07T23:59:59Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  vote_end_at: Date;

  // Accounts
  @ApiProperty({
    description: '검수 계정 미니코드',
    example: 'ic57m',
  })
  @IsString()
  reviewer_minicode: string | null;

  @ApiProperty({
    description: '심사 계정 미니코드 목록',
    example: ['ic57m', 'happy'],
  })
  @IsArray()
  @IsString({ each: true })
  judge_minicodes: string[];

  // Collections
  @ApiProperty({
    type: [CreateGiftCollectionDto],
    description: '선물 컬렉션 목록',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGiftCollectionDto)
  collections: CreateGiftCollectionDto[];
}
