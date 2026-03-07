import {
  Controller,
  Body,
  Get,
  Post,
  Param,
  Request,
  Response,
  HttpCode,
  Ip,
  UnauthorizedException, // 401
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @ApiOperation({ summary: '신규 사용자 등록' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: '성공적으로 사용자가 등록됨' })
  @ApiResponse({ status: 409, description: '이미 존재하는 minicode' })
  async createUser(@Body() dto: CreateUserDto) {
    return await this.authService.createUser(dto.minicode);
  }

  @Get('/exist/:minicode')
  @ApiOperation({ summary: '사용자 존재 여부 조회' })
  @ApiParam({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '등록된 사용자임' })
  @ApiResponse({ status: 404, description: '등록되지 않은 사용자임' })
  async getUserExist(@Param('minicode') minicode: string) {
    return await this.authService.checkUserExist(minicode);
  }

  @Get('/judge/exist/:minicode')
  @ApiOperation({ summary: '심사위원 임명 여부 조회' })
  @ApiParam({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '임명된 심사위원임' })
  @ApiResponse({
    status: 404,
    description: '심사위원이 아니거나 존재하지 않는 사용자임',
  })
  async getJudgeExist(@Param('minicode') minicode: string) {
    return await this.authService.checkJudgeExist(minicode);
  }

  @Post('/login')
  @HttpCode(200)
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (존재하지 않는 사용자 또는 잘못된 enter_code)',
  })
  @ApiResponse({
    status: 423,
    description: '계정 잠금 (로그인 시도 횟수 초과)',
  })
  async loginUser(@Body() dto: LoginDto, @Request() req: any) {
    const userInfo = await this.authService.validateUser(
      dto.minicode,
      dto.enter_code,
    );

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    req.session.account = 'user';
    req.session.user_id = userInfo.user_id;
    req.session.minicode = userInfo.minicode;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    return {
      data: {
        account: 'user',
        user_id: userInfo.user_id,
        minicode: userInfo.minicode,
      },
    };
  }

  @Post('/judge/login')
  @HttpCode(200)
  @ApiOperation({ summary: '심사위원 로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급' })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (존재하지 않는 심사위원 또는 잘못된 enter_code)',
  })
  @ApiResponse({
    status: 423,
    description: '계정 잠금 (로그인 시도 횟수 초과)',
  })
  async loginJudge(@Body() dto: LoginDto, @Request() req: any) {
    const judgeInfo = await this.authService.validateJudge(
      dto.minicode,
      dto.enter_code,
    );

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    req.session.account = 'judge';
    req.session.user_id = judgeInfo.user_id;
    req.session.minicode = judgeInfo.minicode;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    return {
      data: {
        account: 'judge',
        user_id: judgeInfo.user_id,
        minicode: judgeInfo.minicode,
      },
    };
  }

  @Post('/admin/login')
  @HttpCode(200)
  @ApiOperation({ summary: '관리자 로그인' })
  @ApiBody({ type: LoginAdminDto })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급' })
  @ApiResponse({ status: 401, description: '인증 실패 (잘못된 enter_code)' })
  @ApiResponse({ status: 423, description: '계정 잠금 (IP 차단)' })
  async loginAdmin(
    @Body() dto: LoginAdminDto,
    @Request() req: any,
    @Ip() ip: string,
  ) {
    await this.authService.validateAdmin(dto.enter_code, ip);

    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    req.session.account = 'admin';
    req.session.user_id = null;
    req.session.minicode = null;

    await new Promise<void>((resolve, reject) => {
      req.session.save((err: any) => {
        if (err) reject(err);
        resolve();
      });
    });

    return {
      data: {
        account: 'admin',
        user_id: null,
        minicode: null,
      },
    };
  }

  @Post('/logout')
  @HttpCode(200)
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Request() req: any, @Response({ passthrough: true }) res: any) {
    res.clearCookie('ff_session_id', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: '.fashion-fever.org',
    });

    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    return;
  }

  @Get('/status')
  @ApiOperation({ summary: '현재 로그인 상태 확인' })
  @ApiResponse({ status: 200, description: '로그인 정보 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async getStatus(
    @Request() req: any,
    @Response({ passthrough: true }) res: any,
  ) {
    const session = req.session;

    if (!session || !session.account) {
      res.clearCookie('ff_session_id');
      throw new UnauthorizedException();
    }

    return {
      account: session.account,
      user_id: session.user_id,
      minicode: session.minicode,
    };
  }
}
