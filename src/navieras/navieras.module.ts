import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NavierasService } from './navieras.service';
import { NavierasController } from './navieras.controller';
import { Naviera } from './entities/naviera.entity';
import { Tarifa } from 'src/tarifas/entities/tarifa.entity';
import { Solicitud } from 'src/solicitudes/entities/solicitud.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Naviera, Tarifa, Solicitud])],
    controllers: [NavierasController],
    providers: [NavierasService],
})
export class NavierasModule {}
