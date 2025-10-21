import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { TarifasService } from './tarifas.service';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { QueryTarifaDto } from './dto/query-tarifa.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Tarifas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tarifas')
export class TarifasController {
  constructor(private readonly tarifasService: TarifasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarifa' })
  @ApiResponse({ status: 201, description: 'Tarifa creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Ya existe una tarifa para esta naviera' })
  create(@Body() createTarifaDto: CreateTarifaDto) {
    return this.tarifasService.create(createTarifaDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Obtener todas las tarifas con filtros y paginación',
    description: 'Retorna tarifas con filtros opcionales, paginación y ordenamiento'
  })
  @ApiResponse({ status: 200, description: 'Tarifas obtenidas exitosamente' })
  findAll(@Query() query: QueryTarifaDto) {
    return this.tarifasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarifa por ID' })
  @ApiResponse({ status: 200, description: 'Tarifa encontrada' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  findOne(@Param('id') id: string) {
    return this.tarifasService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarifa' })
  @ApiResponse({ status: 200, description: 'Tarifa actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  update(@Param('id') id: string, @Body() updateTarifaDto: UpdateTarifaDto) {
    return this.tarifasService.update(+id, updateTarifaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una tarifa' })
  @ApiResponse({ status: 200, description: 'Tarifa eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Tarifa no encontrada' })
  remove(@Param('id') id: string, @Req() req) {
    console.log('Usuario que realiza la eliminación:', req.user.id);
    return this.tarifasService.remove(+id, req.user.id);
  }
}
