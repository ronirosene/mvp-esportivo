import { IsInt, Min, IsBoolean, IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, AgeCategory } from '@prisma/client';

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

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ enum: AgeCategory })
  @IsEnum(AgeCategory)
  @IsOptional()
  ageCategory?: AgeCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  displayName?: string;
}
