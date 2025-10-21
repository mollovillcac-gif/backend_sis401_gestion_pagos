import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfiguracionesService } from './configuraciones.service';
import { CreateConfiguracionDto } from './dto/create-configuracion.dto';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Configuraciones')
@Controller('configuraciones')
export class ConfiguracionesController {
  constructor(private readonly configuracionesService: ConfiguracionesService) {}

  @Post()
  create(@Body() createConfiguracioneDto: CreateConfiguracionDto) {
    return this.configuracionesService.create(createConfiguracioneDto);
  }

  @Get()
  findAll() {
    return this.configuracionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configuracionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConfiguracioneDto: UpdateConfiguracionDto) {
    return this.configuracionesService.update(+id, updateConfiguracioneDto);
  }
}
