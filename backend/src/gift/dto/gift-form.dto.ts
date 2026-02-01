import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class GiftFormDto {
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
    description: '선물 이미지 경로',
  })
  @IsString()
  @IsOptional()
  gift_url: string | null;

  @ApiProperty({
    description: '선물 이미지 내 순서 (0부터 시작)',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  gift_file_order: number | null;
}
