import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'Grupo A', description: 'Nome do grupo' })
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
