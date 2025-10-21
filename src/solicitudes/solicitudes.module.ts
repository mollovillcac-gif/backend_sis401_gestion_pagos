import { Module } from '@nestjs/common';
import { SolicitudesService } from './solicitudes.service';
import { SolicitudesController } from './solicitudes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Solicitud } from './entities/solicitud.entity';
import { Tarifa } from 'src/tarifas/entities/tarifa.entity';
import { Configuracion } from 'src/configuraciones/entities/configuracion.entity';
import { Naviera } from 'src/navieras/entities/naviera.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { TarifasModule } from 'src/tarifas/tarifas.module';
import { ConfiguracionesModule } from 'src/configuraciones/configuraciones.module';
import { FileService } from 'src/common/services/file.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Solicitud, Tarifa, Configuracion, Naviera, Usuario]),
    TarifasModule,
    ConfiguracionesModule,
  ],
  controllers: [SolicitudesController],
  providers: [SolicitudesService, FileService],
})
export class SolicitudesModule {}
