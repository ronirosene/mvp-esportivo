import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventSportCityDto {
  @ApiProperty({ example: 'uuid-da-cidade' })
  @IsString()
  @IsNotEmpty()
  cityId!: string;
}

export class BulkCreateEventSportCityDto {
  @ApiProperty({ example: ['uuid-1', 'uuid-2', 'uuid-3'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  cityIds!: string[];
}
