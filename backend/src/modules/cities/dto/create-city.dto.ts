import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCityDto {
  @ApiProperty({ example: 'Ibirá' })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  estado!: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  siglaEstado!: string;
}
