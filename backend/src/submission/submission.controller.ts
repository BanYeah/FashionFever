import {
  Controller,
  Session,
  Body,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Request,
  Response,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { SubmissionService } from '../submission/submission.service';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateSubmissionDto } from './dto/createSubmission.dto';

@ApiTags('Submission')
@Controller('submissions')
export class SubmissionController {
  constructor(private submissionService: SubmissionService) {}

  @Post(':theme_id')
  @Roles('user')
  @ApiOperation({
    summary: '테마 참가 및 스타일 제출 (사용자)',
    description: '테마 참가와 관련해 스타일을 한 번에 등록합니다.',
  })
  @ApiBody({ type: CreateSubmissionDto })
  @ApiResponse({ status: 201, description: '테마에 성공적으로 참가됨' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (필수 파일 누락 또는 데이터 검증 실패)',
  })
  @ApiResponse({ status: 410, description: '테마 참가 기간이 종료됨' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'content_files', maxCount: 4 }]),
  )
  async createSubmission(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @UploadedFiles() files: { content_files?: Express.Multer.File[] },
    @Body() body: any,
  ) {
    const dto: CreateSubmissionDto = {
      contents:
        typeof body.contents === 'string'
          ? JSON.parse(body.contents)
          : body.contents,
    };

    return this.submissionService.createSubmission(
      themeId,
      session.user_id,
      dto,
      files.content_files ? files.content_files : [],
    );
  }

  @Get(':theme_id')
  @Roles('user')
  @ApiOperation({ summary: '제출 스타일 조회 (사용자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '스타일 조회 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getSubmissions(
    @Session() session: any,
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return this.submissionService.getSubmissions(themeId, session.user_id);
  }
}
