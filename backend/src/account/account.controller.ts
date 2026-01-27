import {
  Body,
  Controller,
  Post,
  Patch,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccountService } from './account.service';

import { Roles } from '../auth/decorators/roles.decorator';
import { FindDto } from './dto/find.dto';
import { MinicodeDto } from './dto/minicode.dto';

@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/users')
  @HttpCode(200)
  @Roles('admin')
  @ApiOperation({
    summary: '전체 유저 정보 조회 (관리자)',
    description: '최신순으로 40개씩 유저 목록을 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '유저 목록 반환 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  async getUsers(@Body() findDto: FindDto) {
    return await this.accountService.findAllUsers(
      findDto.page,
      findDto.minicode,
    );
  }

  @Post('/judges')
  @HttpCode(200)
  @Roles('admin')
  @ApiOperation({
    summary: '전체 심사위원 정보 조회 (관리자)',
    description: '최신순으로 40개씩 심사위원 목록을 가져옵니다.',
  })
  @ApiResponse({ status: 200, description: '심사위원 목록 반환 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  async getJudges(@Body() findDto: FindDto) {
    return await this.accountService.findAllJudges(
      findDto.page,
      findDto.minicode,
    );
  }

  @Patch('/users/reset-code')
  @Roles('admin')
  @ApiOperation({ summary: '유저 입장 코드 재발급 (관리자)' })
  @ApiResponse({ status: 200, description: '재발급 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  async resetCode(@Body() minicodeDto: MinicodeDto) {
    return await this.accountService.resetUserEnterCode(minicodeDto.minicode);
  }

  @Patch('/judges/appoint')
  @Roles('admin')
  @ApiOperation({
    summary: '심사위원 임명 (관리자)',
    description: '특정 유저를 심사위원 목록에 추가합니다.',
  })
  @ApiResponse({ status: 200, description: '심사위원 임명 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  @ApiResponse({ status: 409, description: '이미 심사위원임' })
  async appointJudge(@Body() minicodeDto: MinicodeDto) {
    return await this.accountService.appointJudge(minicodeDto.minicode);
  }

  @Delete('/users/delete')
  @Roles('admin')
  @ApiOperation({ summary: '유저 완전 삭제 (관리자)' })
  @ApiResponse({ status: 200, description: '유저 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  async deleteUser(@Body() minicodeDto: MinicodeDto) {
    await this.accountService.removeUser(minicodeDto.minicode);
    return { message: 'User deleted successfully' };
  }

  @Delete('/judges/expel')
  @Roles('admin')
  @ApiOperation({ summary: '심사위원 해임 (관리자)' })
  @ApiResponse({ status: 200, description: '심사위원 해임 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({ status: 404, description: '심사위원 없음' })
  async expelJudge(@Body() minicodeDto: MinicodeDto) {
    await this.accountService.expelJudge(minicodeDto.minicode);
    return { message: 'Judge authority removed successfully' };
  }
}
