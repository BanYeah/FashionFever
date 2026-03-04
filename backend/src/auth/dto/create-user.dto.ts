import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '미니코드' })
  @IsString()
  @IsNotEmpty()
  minicode: string;
}
