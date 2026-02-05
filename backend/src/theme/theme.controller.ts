import {
  Controller,
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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ThemeService } from './theme.service';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { ThemeFormDto } from './dto/theme-form.dto';

@ApiTags('')
@Controller('themes')
export class ThemeController {
  constructor(private themeService: ThemeService) {}

  themeFormDto(body: any): ThemeFormDto {
    const dto: ThemeFormDto = {
      ...body,
      bg_limit: body.bg_limit ? Number(body.bg_limit) : null,
      banner_url: body.banner_url ? body.banner_url : null,
      reviewer_minicode: body.reviewer_minicode ? body.reviewer_minicode : null,
      judge_minicodes: Array.isArray(body.judge_minicodes)
        ? body.judge_minicodes
        : body.judge_minicodes
          ? [body.judge_minicodes]
          : [],
      collections:
        typeof body.collections === 'string'
          ? JSON.parse(body.collections)
          : body.collections,
    };

    return dto;
  }

  @Get('')
  @ApiTags('Theme')
  @ApiOperation({ summary: '전체 테마 조회' })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: '테마 목록 반환 성공' })
  async getThemes(@Query('page') page: number) {
    return this.themeService.getThemes(page);
  }

  @Get(':theme_id/header')
  @ApiTags('Theme')
  @ApiOperation({ summary: '테마 헤더 정보 조회' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '테마 헤더 정보 반환 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getThemeHeader(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return this.themeService.getThemeHeader(themeId);
  }

  @Get(':theme_id/gift')
  @ApiTags('Theme')
  @ApiOperation({ summary: '테마 선물 목록 조회' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '테마 선물 목록 반환 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getThemeGifts(@Param('theme_id', new ParseUUIDPipe()) themeId: string) {
    return this.themeService.getThemeGifts(themeId);
  }

  @Get(':theme_id/status')
  @ApiTags('Theme')
  @ApiOperation({ summary: '테마 상태 조회' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '테마 상태 반환 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getThemeStatus(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return this.themeService.getThemeStatus(themeId);
  }

  @Post('setting')
  @Roles('admin')
  @ApiTags('Theme Setting')
  @ApiOperation({
    summary: '테마 설정 등록 (관리자)',
    description:
      '테마 일정, 헤더, 배너 이미지, 리뷰어/심사위원, 선물 컬렉션을 한 번에 등록합니다.',
  })
  @ApiBody({ type: ThemeFormDto })
  @ApiResponse({ status: 201, description: '테마 설정이 성공적으로 등록됨' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (필수 파일 누락 또는 데이터 검증 실패)',
  })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'gift_files', maxCount: 30 },
    ]),
  )
  async createTheme(
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      gift_files?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    const dto: ThemeFormDto = this.themeFormDto(body);
    return this.themeService.createThemeSetting(
      dto,
      files.banner && files.banner.length > 0 ? files.banner[0] : null,
      files.gift_files ? files.gift_files : [],
    );
  }

  @Get('setting')
  @Roles('admin')
  @ApiTags('Theme Setting')
  @ApiOperation({ summary: '전체 테마 설정 조회 (관리자)' })
  @ApiQuery({
    name: 'page',
    description: '페이지 번호 (1부터 시작)',
    example: 1,
  })
  @ApiResponse({ status: 200, description: '테마 설정 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  async getThemeSettings(@Query('page') page: number) {
    return this.themeService.getThemeSettings(page);
  }

  @Get(':theme_id/setting')
  @Roles('admin')
  @ApiTags('Theme Setting')
  @ApiOperation({ summary: '테마 설정 상세 조회 (관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '테마 설정 조회 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getThemeSetting(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return this.themeService.getThemeSetting(themeId);
  }

  @Patch(':theme_id/setting')
  @Roles('admin')
  @ApiTags('Theme Setting')
  @ApiOperation({
    summary: '테마 설정 수정 (관리자)',
    description:
      '테마 일정, 헤더, 배너 이미지, 리뷰어/심사위원, 선물 컬렉션을 한 번에 수정합니다.',
  })
  @ApiBody({ type: ThemeFormDto })
  @ApiResponse({ status: 200, description: '테마 설정이 성공적으로 수정됨' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (필수 파일 누락 또는 데이터 검증 실패)',
  })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({
    status: 404,
    description: '존재하지 않는 테마임',
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'gift_files', maxCount: 30 },
    ]),
  )
  async patchTheme(
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      gift_files?: Express.Multer.File[];
    },
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
    @Body() body: any,
  ) {
    const dto: ThemeFormDto = this.themeFormDto(body);
    return this.themeService.patchThemeSetting(
      themeId,
      dto,
      files.banner && files.banner.length > 0 ? files.banner[0] : null,
      files.gift_files ? files.gift_files : [],
    );
  }

  @Delete(':theme_id/setting')
  @Roles('admin')
  @ApiTags('Theme Setting')
  @ApiOperation({ summary: '테마 설정 삭제 (관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '테마 설정 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 부족 (어드민 아님)' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async deleteThemeSetting(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return this.themeService.deleteThemeSetting(themeId);
  }
}
