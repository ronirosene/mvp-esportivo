import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CityPortalService } from './city-portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Portal da Cidade')
@Controller()
export class CityPortalController {
  constructor(private readonly service: CityPortalService) {}

  @Post('admin/city-users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar usuário de cidade' })
  createCityUser(@Body() data: { nome: string; email: string; senha: string; cityId: string }) {
    return this.service.createCityUser(data);
  }

  @Get('admin/city-users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar usuários de cidade' })
  listCityUsers() {
    return this.service.listCityUsers();
  }

  @Put('admin/city-users/:id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ativar/desativar usuário' })
  toggleActive(@Param('id') id: string) {
    return this.service.toggleUserActive(id);
  }

  @Put('admin/city-users/:id/reset-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Redefinir senha' })
  resetPassword(@Param('id') id: string, @Body() data: { senha: string }) {
    return this.service.resetPassword(id, data.senha);
  }

  @Post('admin/invites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar convite para usuário' })
  generateInvite(@Body() data: { userId: string }) {
    return this.service.generateInvite(data.userId);
  }

  @Get('city/events')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eventos disponíveis' })
  getAvailableEvents(@Request() req: any) {
    if (req.user.role !== 'CIDADE') throw new ForbiddenException('Acesso restrito');
    return this.service.getAvailableEvents(req.user.cityId);
  }

  @Post('city/event-sports/:id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Inscrever cidade em modalidade' })
  register(@Param('id') eventSportId: string, @Request() req: any) {
    if (req.user.role !== 'CIDADE') throw new ForbiddenException('Acesso restrito');
    return this.service.registerEventSport(req.user.cityId, eventSportId);
  }

  @Delete('city/event-sports/:id/register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancelar inscrição' })
  cancel(@Param('id') eventSportId: string, @Request() req: any) {
    if (req.user.role !== 'CIDADE') throw new ForbiddenException('Acesso restrito');
    return this.service.cancelRegistration(req.user.cityId, eventSportId);
  }

  @Get('city/registrations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Minhas inscrições' })
  myRegistrations(@Request() req: any) {
    if (req.user.role !== 'CIDADE') throw new ForbiddenException('Acesso restrito');
    return this.service.myRegistrations(req.user.cityId);
  }

  @Get('public/invite/:token')
  @ApiOperation({ summary: 'Aceitar convite' })
  acceptInvite(@Param('token') token: string) {
    return this.service.acceptInvite(token);
  }
}
