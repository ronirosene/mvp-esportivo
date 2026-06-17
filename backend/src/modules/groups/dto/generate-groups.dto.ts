import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateGroupsDto {
  @ApiProperty({ example: 2, description: 'Quantidade de grupos' })
  @IsInt()
  @Min(1)
  groupCount!: number;
}
