import {
  Controller,
  Body,
  Get,
  Post,
  Param,
  Request,
  Response,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ThemeService } from './theme.service';

@ApiTags('themes')
@Controller('themes')
export class ThemeController {
  constructor(private themeService: ThemeService) {}
}
