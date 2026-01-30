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
import { GiftService } from './gift.service';

@ApiTags('gifts')
@Controller('gifts')
export class GiftController {
  constructor(private giftService: GiftService) {}
}
