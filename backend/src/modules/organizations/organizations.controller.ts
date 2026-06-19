import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar organização' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar organizações' })
  findAll() {
    return this.organizationsService.findAll();
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard global (admin)' })
  getDashboard(@Request() req: any) {
    if (req.user.role === 'ADMIN_GLOBAL') {
      return this.organizationsService.getDashboard();
    }
    return this.organizationsService.getOrgDashboard(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter organização por ID' })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obter organização por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.organizationsService.findBySlug(slug);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar organização' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir organização' })
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
