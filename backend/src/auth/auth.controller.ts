import { Body, Controller, Get, Post, Param, Request, HttpCode, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

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
    return await this.authService.checkUserExist(minicode);
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
    return await this.authService.checkJudgeExist(minicode);
  }

  @Post('/login')
  @HttpCode(200)
  @ApiOperation({
    summary: '일반 유저 로그인',
    description:
      '입력받은 minicode와 enter_code를 검증하여 로그인을 수행하고 쿠키를 발급합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급' })
  @ApiResponse({ status: 401, description: '인증 실패 (존재하지 않는 유저 또는 잘못된 enter_code)' })
  @ApiResponse({ status: 423, description: '계정 잠금 (로그인 시도 횟수 초과)' })
  async loginUser(@Body() loginDto: LoginDto, @Request() req: any) {
    const userInfo = await this.authService.validateUser(loginDto);

    req.session.account = 'user';
    req.session.user_id = userInfo.user_id;
    req.session.minicode = userInfo.minicode;
    req.session.save()

    return;
  }

  @Post('/judges/login')
  @HttpCode(200)
  @ApiOperation({
    summary: '심사위원 로그인',
    description:
      '입력받은 minicode와 enter_code를 검증하여 로그인을 수행하고 쿠키를 발급합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급' })
  @ApiResponse({ status: 401, description: '인증 실패 (존재하지 않는 유저 또는 잘못된 enter_code)' })
  @ApiResponse({ status: 423, description: '계정 잠금 (로그인 시도 횟수 초과)' })
  async loginJudge(@Body() loginDto: LoginDto, @Request() req: any) {
    const judgeInfo = await this.authService.validateJudge(loginDto);

    req.session.account = 'judge';
    req.session.user_id = judgeInfo.user_id;
    req.session.minicode = judgeInfo.minicode;
    req.session.save()

    return;
  }

  @Post('/admin/login')
  @HttpCode(200)
  @ApiOperation({
    summary: '관리자 로그인',
    description:
      '입력받은 enter_code를 검증하여 로그인을 수행하고 쿠키를 발급합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급' })
  @ApiResponse({ status: 401, description: '인증 실패 (잘못된 enter_code)' })
  @ApiResponse({ status: 423, description: '계정 잠금 (IP 차단)' })
  async loginAdmin(@Body() loginAdminDto: LoginAdminDto, @Request() req: any, @Ip() ip: string) {
    await this.authService.validateAdmin(loginAdminDto, ip);

    req.session.account = 'admin';
    req.session.save()

    return;
  }

  @Post('/logout')
  @HttpCode(200)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Request() req: any) {
    req.session.destroy();
    return { message: 'Logged out successfully' };
  }
}
