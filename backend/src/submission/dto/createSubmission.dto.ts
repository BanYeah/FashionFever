import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class SubmissionFormDto {
  @ApiProperty({
    description: '제출 이미지 경로',
  })
  @IsString()
  @IsOptional()
  content_url: string | null;

  @ApiProperty({
    description: '제출 이미지 파일 순서',
  })
  @IsNumber()
  @IsOptional()
  content_file_order: number | null;
}

export class CreateSubmissionDto {
  @ApiProperty({
    type: [SubmissionFormDto],
    description: '제출 목록',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionFormDto)
  contents: SubmissionFormDto[];
}
