import { ApiProperty } from '@nestjs/swagger';

export class PageDto {
  @ApiProperty({ description: '페이지 번호 (1부터 시작)', example: 1 })
  page: number;
}