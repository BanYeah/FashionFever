import { ApiProperty } from '@nestjs/swagger';

export class FindDto {
  @ApiProperty({ description: '페이지 번호 (1부터 시작)', example: 1 })
  page: number;

  @ApiProperty({ description: '미니코드', example: 'ic57m' })
  minicode: string | null;
}
