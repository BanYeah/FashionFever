import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  Query,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AccountService } from './account.service';

import { Roles } from '../auth/decorators/roles.decorator';

import { FindDto } from './dto/find.dto';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/users')
  @HttpCode(200)
  @Roles('admin')
  @ApiOperation({
    summary: '전체 사용자 정보 조회 (관리자)',
    description: '최신순으로 40개씩 사용자 목록을 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '사용자 목록 반환 성공' })
  async getUsers(@Body() dto: FindDto) {
    return await this.accountService.findAllUsers(dto.page, dto.minicode);
  }

  @Post('/judges')
  @HttpCode(200)
  @Roles('admin')
  @ApiOperation({
    summary: '전체 심사위원 정보 조회 (관리자)',
    description: '최신순으로 40개씩 심사위원 목록을 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '심사위원 목록 반환 성공' })
  async getJudges(@Body() dto: FindDto) {
    return await this.accountService.findAllJudges(dto.page, dto.minicode);
  }

  @Patch('/users/reset-code')
  @Roles('admin')
  @ApiOperation({ summary: '사용자 입장 코드 재발급 (관리자)' })
  @ApiQuery({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '재발급 성공' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async resetCode(@Query('minicode') minicode: string) {
    return await this.accountService.resetUserEnterCode(minicode);
  }

  @Patch('/judges/appoint')
  @Roles('admin')
  @ApiOperation({
    summary: '심사위원 임명 (관리자)',
    description: '특정 사용자를 심사위원에 임명합니다.',
  })
  @ApiQuery({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '심사위원 임명 성공' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  @ApiResponse({ status: 409, description: '이미 심사위원임' })
  async appointJudge(@Query('minicode') minicode: string) {
    return await this.accountService.appointJudge(minicode);
  }

  @Delete('/users/delete')
  @Roles('admin')
  @ApiOperation({ summary: '사용자 완전 삭제 (관리자)' })
  @ApiQuery({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '사용자 삭제 성공' })
  @ApiResponse({ status: 400, description: '사용자 삭제 불가' })
  @ApiResponse({ status: 404, description: '사용자 없음' })
  async deleteUser(@Query('minicode') minicode: string) {
    return await this.accountService.removeUser(minicode);
  }

  @Delete('/judges/expel')
  @Roles('admin')
  @ApiOperation({ summary: '심사위원 해임 (관리자)' })
  @ApiQuery({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '심사위원 해임 성공' })
  @ApiResponse({ status: 404, description: '심사위원 없음' })
  async expelJudge(@Query('minicode') minicode: string) {
    return await this.accountService.expelJudge(minicode);
  }
}
