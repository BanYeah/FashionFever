import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({ description: '입장코드' })
  @IsString()
  @IsNotEmpty()
  enter_code: string;
}
