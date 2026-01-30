import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class MinicodeDto {
  @ApiProperty({ description: '미니코드', example: 'ic57m' })
  @IsString()
  @IsNotEmpty()
  minicode: string;
}
