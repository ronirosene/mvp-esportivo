import { IsOptional, IsInt, Min, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '@prisma/client';

export class UpdateMatchDto {
  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  homeScore?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  awayScore?: number;

  @ApiPropertyOptional({ example: '2026-08-12T14:00:00Z' })
  @IsOptional()
  @IsString()
  matchDate?: string;

  @ApiPropertyOptional({ example: 'Ginásio Municipal' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: MatchStatus })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ description: 'Rodada' })
  @IsOptional()
  @IsInt()
  @Min(1)
  round?: number;

  @ApiPropertyOptional({ description: 'Ordem de exibição' })
  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;
}
