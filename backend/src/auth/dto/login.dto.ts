import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '미니코드', example: 'ic57m' })
  minicode: string;

  @ApiProperty({ description: '입장코드', example: 'ic57mic57m' })
  enter_code: string;
}
