import { IsInt, Min, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEventSportDto {
  @ApiPropertyOptional({ description: 'Número de classificados por grupo', default: 2 })
  @IsInt()
  @Min(1)
  @IsOptional()
  classificationCount?: number;

  @ApiPropertyOptional({ description: 'Gerar partida de terceiro lugar', default: true })
  @IsBoolean()
  @IsOptional()
  generateThirdPlace?: boolean;
}
