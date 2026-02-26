import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateVoteDto {
  @ApiProperty({
    description: '투표 번호',
  })
  @IsString()
  @IsOptional()
  vote_id: string | null;

  @ApiProperty({
    description: '후보 1의 제출 번호',
  })
  @IsString()
  @IsOptional()
  sub_id1: string | null;

  @ApiProperty({
    description: '후보 2의 제출 번호',
  })
  @IsString()
  @IsOptional()
  sub_id2: string | null;

  @ApiProperty({
    description: '승리한 후보 번호',
  })
  @IsNumber()
  @IsOptional()
  winner_side: number | null;
}
