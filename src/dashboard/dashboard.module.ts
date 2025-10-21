import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { Naviera } from '../navieras/entities/naviera.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Solicitud, Naviera])],
    controllers: [DashboardController],
    providers: [DashboardService],
})
export class DashboardModule {}
