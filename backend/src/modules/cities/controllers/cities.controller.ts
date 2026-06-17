import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CitiesService } from '../services/cities.service';
import { CreateCityDto } from '../dto/create-city.dto';
import { UpdateCityDto } from '../dto/update-city.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar cidade' })
  create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cidades' })
  findAll() {
    return this.citiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter cidade por ID' })
  findOne(@Param('id') id: string) {
    return this.citiesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar cidade' })
  update(@Param('id') id: string, @Body() dto: UpdateCityDto) {
    return this.citiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir cidade' })
  remove(@Param('id') id: string) {
    return this.citiesService.remove(id);
  }
}
