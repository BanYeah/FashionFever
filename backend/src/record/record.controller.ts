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
  @ApiResponse({ status: 403, description: '권한 부족 (사용자 아님)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
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
  @ApiResponse({ status: 403, description: '권한 부족 (사용자 아님)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
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
  async getThemes(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @Query('page') page: number,
  ) {
    return this.recordService.getRecordRankings(themeId, page);
  }
}
