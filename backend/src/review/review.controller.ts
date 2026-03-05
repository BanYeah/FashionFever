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
import { ReviewService } from '../review/review.service';

import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Review')
@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get(':theme_id')
  @Roles('judge', 'admin')
  @ApiOperation({ summary: '전체 검수된 스타일 조회 (심사위원, 관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    example: 1,
  })
  @ApiQuery({
    name: 'status',
    description: '검수 상태 (approved | rejected)',
    example: 'approved',
  })
  @ApiResponse({ status: 200, description: '스타일 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getReviews(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @Query('page') page: number,
    @Query('status') status: 'approved' | 'rejected',
  ) {
    return this.reviewService.getReviews(session, themeId, page, status);
  }

  @Get(':theme_id/pending')
  @Roles('judge', 'admin')
  @ApiOperation({ summary: '검수 대기 중인 스타일 조회 (심사위원, 관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '스타일 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 부족' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getReviewPending(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return await this.reviewService.getReviewPending(session, themeId);
  }

  @Get(':theme_id/status')
  @Roles('judge', 'admin')
  @ApiOperation({ summary: '검수 권한 조회 (심사위원, 관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '권한 조회 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getReviewStatus(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return await this.reviewService.getReviewStatus(session, themeId);
  }

  @Patch(':submission_id')
  @Roles('judge', 'admin')
  @ApiOperation({ summary: '검수 상태 수정 (심사위원, 관리자)' })
  @ApiParam({
    name: 'submission_id',
    description: '제출 번호',
  })
  @ApiQuery({
    name: 'status',
    description: '검수 상태 (approved | rejected)',
    example: 'approved',
  })
  @ApiResponse({
    status: 200,
    description: '검수 상태가 성공적으로 수정됨',
  })
  @ApiResponse({ status: 403, description: '권한 부족' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마/제출임' })
  @ApiResponse({ status: 410, description: '테마 검수 기간이 종료됨' })
  async patchReviewStatus(
    @Session() session: any,
    @Param('submission_id') subId: string,
    @Query('status') status: 'approved' | 'rejected',
  ) {
    return await this.reviewService.patchReviewStatus(session, subId, status);
  }
}
