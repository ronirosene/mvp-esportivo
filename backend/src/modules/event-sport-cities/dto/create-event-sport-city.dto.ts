import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventSportCityDto {
  @ApiProperty({ example: 'uuid-da-cidade' })
  @IsString()
  @IsNotEmpty()
  cityId!: string;
}
