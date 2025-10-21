import { Module } from '@nestjs/common';
import { TarifasService } from './tarifas.service';
import { TarifasController } from './tarifas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tarifa } from './entities/tarifa.entity';
import { Naviera } from 'src/navieras/entities/naviera.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tarifa, Naviera])], // Importa el módulo TypeOrmModule y registra las entidades
  controllers: [TarifasController],
  providers: [TarifasService],
  exports: [TypeOrmModule], // Exporta el servicio si es necesario para otros módulos
})
export class TarifasModule {}
