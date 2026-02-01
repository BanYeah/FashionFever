import {
  Controller,
  Body,
  Get,
  Post,
  Patch,
  Param,
  Request,
  Response,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ThemeService } from './theme.service';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { ThemeFormDto } from './dto/theme-form.dto';

@ApiTags('themes')
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

  @Post('setting')
  @Roles('admin')
  @ApiOperation({
    summary: '테마 설정 등록 (관리자)',
    description:
      '테마 일정, 헤더, 배너 이미지, 리뷰어/심사위원, 선물 컬렉션을 한 번에 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '테마 설정이 성공적으로 등록됨' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (필수 파일 누락 또는 데이터 검증 실패)',
  })
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

  @Get(':theme_id/setting')
  @Roles('admin')
  @ApiOperation({ summary: '테마 설정 상세 조회 (관리자)' })
  @ApiParam({
    name: 'theme_id',
    description: '테마 번호',
  })
  @ApiResponse({ status: 200, description: '테마 설정 조회 성공' })
  @ApiResponse({ status: 404, description: '존재하지 않는 테마임' })
  async getThemeSetting(
    @Param('theme_id', new ParseUUIDPipe()) themeId: string,
  ) {
    return this.themeService.getThemeSetting(themeId);
  }

  @Patch(':theme_id/setting')
  @Roles('admin')
  @ApiOperation({
    summary: '테마 설정 수정 (관리자)',
    description:
      '테마 일정, 헤더, 배너 이미지, 리뷰어/심사위원, 선물 컬렉션을 한 번에 수정합니다.',
  })
  @ApiResponse({ status: 200, description: '테마 설정이 성공적으로 수정됨' })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (필수 파일 누락 또는 데이터 검증 실패)',
  })
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
}
