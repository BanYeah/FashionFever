import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ description: '입장코드', example: 'ic57mic57m' })
  @IsString()
  @IsNotEmpty()
  enter_code: string;
}
