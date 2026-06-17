import { IsString, IsUUID, IsOptional, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Fase } from '@prisma/client';

export class CreateManualMatchDto {
  @ApiProperty({ description: 'ID da cidade mandante' })
  @IsString()
  @IsUUID()
  homeCityId!: string;

  @ApiProperty({ description: 'ID da cidade visitante' })
  @IsString()
  @IsUUID()
  awayCityId!: string;

  @ApiPropertyOptional({ description: 'Data e hora da partida (ISO)' })
  @IsString()
  @IsOptional()
  matchDate?: string;

  @ApiPropertyOptional({ description: 'Local da partida' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Rodada' })
  @IsInt()
  @IsOptional()
  round?: number;

  @ApiPropertyOptional({ description: 'Ordem de exibição' })
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Fase', enum: Fase, default: 'GRUPOS' })
  @IsEnum(Fase)
  @IsOptional()
  fase?: Fase;
}
