import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: '미니코드', example: 'ic57m' })
  @IsString()
  @IsNotEmpty()
  minicode: string;

  @ApiProperty({ description: '입장코드', example: 'ic57mic57m' })
  @IsString()
  @IsNotEmpty()
  enter_code: string;
}
