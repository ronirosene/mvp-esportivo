import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty({ example: 'Jogos Escolares 2026' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 2026 })
  @IsNumber()
  ano!: number;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  cidadeSede!: string;

  @ApiProperty({ example: '2026-07-01' })
  @IsDateString()
  dataInicio!: string;

  @ApiProperty({ example: '2026-07-15' })
  @IsDateString()
  dataFim!: string;

  @ApiProperty({ enum: EventStatus, example: 'PLANEJAMENTO' })
  @IsEnum(EventStatus)
  status!: EventStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
