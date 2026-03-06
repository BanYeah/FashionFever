import { Controller, Session, Get, Request, Response } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';

import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Schedule')
@Controller('schedules')
export class ScheduleController {
  constructor(private scheuleService: ScheduleService) {}

  @Get('/timeline')
  @ApiOperation({ summary: '이벤트 기간 조회' })
  @ApiResponse({ status: 200, description: '이벤트 기간 반환 성공' })
  async getTimeline() {
    return this.scheuleService.getTimeline();
  }

  @Get('/voting-now')
  @ApiOperation({ summary: '투표 중인 테마 조회' })
  @ApiResponse({ status: 200, description: '투표 중인 테마 반환 성공' })
  @ApiResponse({ status: 404, description: '투표 중인 테마 없음' })
  async getVotingNow() {
    return this.scheuleService.getVotingNow();
  }

  @Get('/judging-now')
  @Roles('judge')
  @ApiOperation({ summary: '심사 가능한 테마 조회 (심사위원)' })
  @ApiResponse({ status: 200, description: '심사 가능한 테마 반환 성공' })
  @ApiResponse({ status: 404, description: '심사 가능한 테마 없음' })
  async getJudgingNow(@Session() session: any) {
    return this.scheuleService.getJudgingNow(session.user_id);
  }
}
