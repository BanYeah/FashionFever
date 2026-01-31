import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class FindDto {
  @ApiProperty({ description: '페이지 번호 (1부터 시작)', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  page: number;

  @ApiProperty({ description: '미니코드', example: 'ic57m' })
  @IsString()
  @IsOptional()
  minicode: string | null;
}
