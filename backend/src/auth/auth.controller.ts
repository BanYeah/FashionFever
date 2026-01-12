import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @ApiOperation({
    summary: '신규 유저 등록',
    description:
      '입력받은 minicode를 사용하여 시스템에 새로운 유저를 생성합니다.',
  })
  @ApiResponse({ status: 201, description: '성공적으로 유저가 등록됨' })
  @ApiResponse({ status: 409, description: '이미 존재하는 minicode' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @Get('/exist/:minicode')
  @ApiOperation({
    summary: '유저 존재 여부 조회',
    description:
      '전달받은 minicode가 유저 테이블에 등록되어 있는지 확인합니다.',
  })
  @ApiParam({
    name: 'minicode',
    description: '미니코드 (5-7자리)',
    example: 'ic57m',
  })
  @ApiResponse({ status: 200, description: '등록된 유저임' })
  @ApiResponse({ status: 404, description: '등록되지 않은 유저임' })
  async getUserExist(@Param('minicode') minicode: string) {
    return await this.authService.getUserExist(minicode);
  }

  @Get('/judges/exist/:minicode')
  @ApiOperation({
    summary: '심사위원 임명 여부 조회',
    description:
      '특정 minicode를 가진 유저가 심사위원 권한을 가지고 있는지 확인합니다.',
  })
  @ApiParam({
    name: 'minicode',
    description: '미니코드 (5-7자리)',
    example: 'ic57m',
  })
  @ApiResponse({ status: 200, description: '임명된 심사위원임' })
  @ApiResponse({
    status: 404,
    description: '심사위원이 아니거나 존재하지 않는 유저임',
  })
  async getJudgeExist(@Param('minicode') minicode: string) {
    return await this.authService.getJudgeExist(minicode);
  }
}
