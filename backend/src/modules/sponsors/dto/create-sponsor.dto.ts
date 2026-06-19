import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSponsorDto {
  @ApiProperty({ example: 'Empresa XYZ' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Patrocinador oficial' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  destaque?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  ordem?: number;

  @ApiPropertyOptional({ enum: ['PATROCINADOR', 'APOIADOR', 'PARCEIRO', 'PUBLICIDADE'], default: 'PATROCINADOR' })
  @IsOptional()
  @IsEnum(['PATROCINADOR', 'APOIADOR', 'PARCEIRO', 'PUBLICIDADE'])
  tipo?: 'PATROCINADOR' | 'APOIADOR' | 'PARCEIRO' | 'PUBLICIDADE';
}
