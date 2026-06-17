import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantDto {
  @ApiProperty({ description: 'ID do EventSportCity' })
  @IsString()
  @IsUUID()
  eventSportCityId!: string;
}
