import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: '미니코드', example: 'ic57m' })
  minicode: string;
}
