import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsDate,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { GiftCollectionFormDto } from 'src/gift/dto/gift-collection-form.dto';

export class ThemeFormDto {
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
  @IsOptional()
  bg_limit: number | null;

  // banner
  @ApiProperty({
    description: '배너 이미지 경로',
  })
  @IsString()
  @IsOptional()
  banner_url: string | null;

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
    description: '검수 시작 시간',
    example: '2026-01-04T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  review_start_at: Date;

  @ApiProperty({
    description: '투표 시작 시간',
    example: '2026-01-05T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  vote_start_at: Date;

  @ApiProperty({
    description: '결과 집계 시작 시간',
    example: '2026-01-07T23:59:59Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  result_start_at: Date;

  // Accounts
  @ApiProperty({
    description: '검수 계정 미니코드',
    example: 'ic57m',
  })
  @IsString()
  @IsOptional()
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
    type: [GiftCollectionFormDto],
    description: '선물 컬렉션 목록',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GiftCollectionFormDto)
  collections: GiftCollectionFormDto[];
}
