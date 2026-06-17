import { IsEnum, IsInt, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FormatType } from '@prisma/client';

export class UpsertCompetitionFormatDto {
  @ApiProperty({ enum: FormatType, description: 'Formato da competição' })
  @IsEnum(FormatType)
  formatType!: FormatType;

  @ApiPropertyOptional({ description: 'Quantidade de grupos (GROUP_STAGE)', default: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  groupCount?: number;

  @ApiPropertyOptional({ description: 'Classificados por grupo (GROUP_STAGE)', default: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  qualifiedPerGroup?: number;

  @ApiPropertyOptional({ description: 'Disputa de terceiro lugar (GROUP_STAGE)', default: true })
  @IsBoolean()
  @IsOptional()
  thirdPlaceMatch?: boolean;

  @ApiPropertyOptional({ description: 'Chaveamento manual (KNOCKOUT)', default: false })
  @IsBoolean()
  @IsOptional()
  manualBracket?: boolean;
}
