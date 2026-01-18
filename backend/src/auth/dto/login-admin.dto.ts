import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({ description: '입장코드', example: 'ic57mic57m' })
  enter_code: string;
}
