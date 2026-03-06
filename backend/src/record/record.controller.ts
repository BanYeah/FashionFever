import {
  Controller,
  Session,
  Get,
  Patch,
  Param,
  Query,
  Request,
  Response,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { RecordService } from './record.service';

import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Record')
@Controller('records')
export class RecordController {
  constructor(private recordService: RecordService) {}

  @Get(':theme_id')
  @Roles('user')
  @ApiOperation({ summary: '모든 기록 조회 (사용자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '기록 조회 성공' })
  @ApiResponse({ status: 404, description: '기록 없음' })
  async getRecords(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return await this.recordService.getRecords(session.user_id, themeId);
  }

  @Get(':theme_id/top1')
  @Roles('user')
  @ApiOperation({ summary: '최고 기록 조회 (사용자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '기록 조회 성공' })
  @ApiResponse({ status: 404, description: '기록 없음' })
  async getTop1Record(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return await this.recordService.getTop1Record(session.user_id, themeId);
  }

  @Get(':theme_id/ranking')
  @ApiOperation({ summary: '전체 기록 조회' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: '기록 목록 반환 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getThemes(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @Query('page') page: number,
  ) {
    return this.recordService.getRecordRankings(themeId, page);
  }

  @Get(':theme_id/status')
  @Roles('user')
  @ApiOperation({ summary: '기록 상태 조회 (사용자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '기록 상태 조회 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getSubmissions(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return await this.recordService.getRecordStat(session.user_id, themeId);
  }

  @Get(':theme_id/delivery')
  @Roles('admin')
  @ApiOperation({ summary: '선물 지급 기록 조회 (관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiQuery({
    name: 'status',
    description: '선물 지급 상태 (all | complete | incomplete)',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    example: 1,
  })
  @ApiQuery({
    name: 'minicode',
    description: '미니코드',
  })
  @ApiResponse({ status: 200, description: '기록 조회 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (데이터 검증 실패)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getDelivery(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @Query('status') status: 'all' | 'complete' | 'incomplete',
    @Query('page') page: number,
    @Query('minicode') minicode?: string,
  ) {
    return await this.recordService.getDelivery(
      themeId,
      status,
      page,
      minicode,
    );
  }

  @Patch(':record_id/delivery')
  @Roles('admin')
  @ApiOperation({ summary: '선물 지급 기록 조회 (관리자)' })
  @ApiParam({
    name: 'record_id',
    description: '기록 번호',
  })
  @ApiQuery({
    name: 'status',
    description: '선물 지급 상태 (complete | incomplete)',
  })
  @ApiResponse({ status: 200, description: '기록 조회 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (데이터 검증 실패)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async patchDelivery(
    @Param('record_id') recordId: string,
    @Query('status') status: 'complete' | 'incomplete',
  ) {
    return await this.recordService.patchDelivery(recordId, status);
  }
}
