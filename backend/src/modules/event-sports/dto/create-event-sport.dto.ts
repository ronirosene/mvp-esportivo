import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventSportDto {
  @ApiProperty({ example: 'uuid-do-esporte' })
  @IsString()
  @IsNotEmpty()
  sportId!: string;
}
