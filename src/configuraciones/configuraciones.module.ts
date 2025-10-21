import { Module } from '@nestjs/common';
import { ConfiguracionesService } from './configuraciones.service';
import { ConfiguracionesController } from './configuraciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Configuracion } from './entities/configuracion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Configuracion])], // Importa el módulo TypeOrmModule y registra la entidad Configuracion
  controllers: [ConfiguracionesController],
  providers: [ConfiguracionesService],
  exports: [TypeOrmModule], // Exporta el servicio si es necesario para otros módulos
})
export class ConfiguracionesModule {}
