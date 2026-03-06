import {
  Controller,
  Session,
  Body,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Request,
  Response,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { VoteService } from './vote.service';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateVoteDto } from './dto/create-vote.dto';

@ApiTags('Vote')
@Controller('votes')
export class VoteController {
  constructor(private voteService: VoteService) {}

  @Post(':theme_id')
  @Roles('user')
  @ApiOperation({ summary: '투표 등록 (사용자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiBody({ type: CreateVoteDto })
  @ApiResponse({ status: 201, description: '성공적으로 투표가 등록됨' })
  @ApiResponse({ status: 400, description: '잘못된 요청 (데이터 검증 실패)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  @ApiResponse({ status: 410, description: '테마 투표 기간이 종료됨' })
  @ApiResponse({ status: 422, description: '테마 투표 후보 부족' })
  async createUser(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @Body() createVoteDto: CreateVoteDto,
  ) {
    return await this.voteService.createVote(
      session.user_id,
      themeId,
      createVoteDto,
    );
  }

  @Get(':theme_id')
  @Roles('user')
  @ApiOperation({ summary: '투표 상태 조회 (사용자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '투표 상태 조회 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getSubmissions(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return await this.voteService.getVoteStatus(session.user_id, themeId);
  }
}
