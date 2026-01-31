import {
  Controller,
  Body,
  Get,
  Post,
  Param,
  Request,
  Response,
  UseInterceptors,
  UploadedFiles,
  BadRequestException, // 400
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ThemeService } from './theme.service';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateThemeSettingDto } from './dto/create-theme.dto';

@ApiTags('themes')
@Controller('themes')
export class ThemeController {
  constructor(private themeService: ThemeService) {}

  @Post('setting')
  @Roles('admin')
  @ApiOperation({
    summary: '테마 설정 등록',
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
      { name: 'giftImages', maxCount: 20 },
    ]),
  )
  async createTheme(
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      giftImages?: Express.Multer.File[];
    },
    @Body() body: any,
  ) {
    if (!files?.banner || files.banner.length === 0)
      throw new BadRequestException('배너 이미지는 필수예요!');

    if (!files?.giftImages || files.giftImages.length === 0)
      throw new BadRequestException('최소 하나 이상의 선물 이미지가 필요해요!');

    const dto: CreateThemeSettingDto = {
      ...body,
      bg_limit: body.bg_limit ? Number(body.bg_limit) : null,
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

    return this.themeService.createThemeSetting(
      dto,
      files.banner[0],
      files.giftImages,
    );
  }
}
