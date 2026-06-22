import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, AgeCategory, DrawMode } from '@prisma/client';

export class CreateEventSportDto {
  @ApiProperty({ example: 'uuid-do-esporte' })
  @IsString()
  @IsNotEmpty()
  sportId!: string;

  @ApiPropertyOptional({ enum: Gender, default: 'OPEN' })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ enum: AgeCategory, default: 'LIVRE' })
  @IsEnum(AgeCategory)
  @IsOptional()
  ageCategory?: AgeCategory;

  @ApiPropertyOptional({ example: 'Futsal Masculino Sub-14' })
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({ enum: DrawMode, default: DrawMode.AUTOMATIC })
  @IsEnum(DrawMode)
  @IsOptional()
  drawMode?: DrawMode;
}
