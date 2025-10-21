import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Solicitud } from '../solicitudes/entities/solicitud.entity';
import { Naviera } from '../navieras/entities/naviera.entity';
import { EstadosSolicitudes, TiposSolicitud } from '../common/enum';

@Injectable()
export class DashboardService {
    constructor(
        @InjectRepository(Solicitud)
        private readonly solicitudRepo: Repository<Solicitud>,
        @InjectRepository(Naviera)
        private readonly navieraRepo: Repository<Naviera>
    ) {}

    async getDashboardData() {
        // Solicitudes creadas hoy
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        // Solicitudes hoy
        const solicitudesHoyRaw = await this.solicitudRepo
            .createQueryBuilder('solicitud')
            .select('COUNT(*)', 'total')
            .where(
                'solicitud.fecha_creacion >= :startDate AND solicitud.fecha_creacion <= :endDate',
                {
                    startDate: today,
                    endDate: endOfToday,
                }
            )
            .getRawOne();
        const solicitudesHoy = Number(solicitudesHoyRaw?.total) || 0;

        // Pagos recibidos hoy: suma de total_final_bs de solicitudes con estado SUBIDO y fecha_creacion de hoy
        const pagosRecibidosRaw = await this.solicitudRepo
            .createQueryBuilder('solicitud')
            .select('COALESCE(SUM(solicitud.totalFinalBs), 0)', 'total')
            .where('solicitud.estado IN (:...estados)', { estados: [EstadosSolicitudes.SUBIDO, EstadosSolicitudes.VERIFICADA, EstadosSolicitudes.PAGADA] })
            .andWhere(
            'solicitud.fechaCreacion >= :startDate AND solicitud.fechaCreacion <= :endDate',
            {
                startDate: today,
                endDate: endOfToday,
            }
            )
            .getRawOne();
        const pagosRecibidos = Number(pagosRecibidosRaw?.total) || 0;

        // Solicitudes listas para revisión: cantidad de solicitudes con estado SUBIDO
        const listasRevisionRaw = await this.solicitudRepo
            .createQueryBuilder('solicitud')
            .select('COUNT(*)', 'total')
            .where('solicitud.estado = :estado', { estado: EstadosSolicitudes.SUBIDO })
            .getRawOne();
        const listasRevision = Number(listasRevisionRaw?.total) || 0;

        // Solicitudes pendientes: cantidad de solicitudes en estado PENDIENTE
        const solicitudesPendientesRaw = await this.solicitudRepo
            .createQueryBuilder('solicitud')
            .select('COUNT(*)', 'total')
            .where('solicitud.estado = :estado', { estado: EstadosSolicitudes.PENDIENTE })
            .getRawOne();
        const solicitudesPendientes = Number(solicitudesPendientesRaw?.total) || 0;

        // Cambios porcentuales ficticios (puedes calcularlos si tienes la lógica)
        const changePercentages = {
            solicitudes: 0,
            recaudacion: 0,
            contenedores: 0,
            pagos: 0,
        };

        // Tasa de aprobación: porcentaje de solicitudes en estado VERIFICADA o PAGADA
        const aprobadasRaw = await this.solicitudRepo
            .createQueryBuilder('solicitud')
            .select('COUNT(*)', 'total')
            .where('solicitud.estado IN (:...estados)', {
                estados: [EstadosSolicitudes.VERIFICADA, EstadosSolicitudes.PAGADA],
            })
            .getRawOne();
        const aprobadas = Number(aprobadasRaw?.total) || 0;
        const totalSolicitudes = await this.solicitudRepo.count();
        const tasaAprobacion =
            totalSolicitudes > 0 ? Number(((aprobadas / totalSolicitudes) * 100).toFixed(2)) : 0;

        // Navieras activas
        const navierasActivas = await this.navieraRepo.count({ where: { activo: true } });

        // Tiempo promedio: ficticio (puedes calcularlo si tienes campo de tiempo)
        const tiempoPromedio = 0;
        // Satisfacción: ficticio
        const satisfaccion = 0;

     // Tendencia de solicitudes pagadas últimos 6 meses (recaudacion = suma de totalFinalBs pagadas)
     const paymentsTrend = await this.solicitudRepo.query(`
         SELECT TO_CHAR(fecha_creacion, 'Mon') AS mes,
             SUM(CASE WHEN estado = '${EstadosSolicitudes.PAGADA}' THEN total_final_bs ELSE 0 END) AS recaudacion,
             COUNT(*) AS solicitudes
         FROM solicitudes
         WHERE fecha_creacion >= NOW() - INTERVAL '6 months'
         GROUP BY mes, DATE_TRUNC('month', fecha_creacion)
         ORDER BY DATE_TRUNC('month', fecha_creacion)
     `);

        // Distribución de tipos de solicitud
        const tipos = Object.values(TiposSolicitud);
        const requestTypeDistribution: Record<string, number> = {};
        for (const tipo of tipos) {
            requestTypeDistribution[tipo] = await this.solicitudRepo.count({
                where: { tipo },
            });
        }

        // Estados de solicitudes
        const estados = Object.values(EstadosSolicitudes);
        const requestStatusStats = [];
        for (const estado of estados) {
            const cantidad = await this.solicitudRepo.count({ where: { estado } });
            requestStatusStats.push({ estado, cantidad });
        }

        // Top navieras por cantidad de solicitudes y monto recaudado
        const topNavieras = await this.solicitudRepo.query(`
            SELECT n.nombre,
                   COUNT(s.id) AS solicitudes,
                   SUM(CASE WHEN s.estado = '${EstadosSolicitudes.PAGADA}' THEN s.total_final_bs ELSE 0 END) AS recaudado
            FROM solicitudes s
            JOIN navieras n ON s.naviera_id = n.id
            GROUP BY n.nombre
            ORDER BY solicitudes DESC
            LIMIT 4
        `);

        // Valores por defecto si no hay datos
        return {
            mainStats: {
                solicitudesHoy: solicitudesHoy || 0,
                pagosRecibidos: pagosRecibidos || 0,
                listasRevision: listasRevision || 0,
                solicitudesPendientes: solicitudesPendientes || 0,
                changePercentages,
            },
            additionalMetrics: {
                tasaAprobacion,
                navierasActivas,
            },
            paymentsTrend,
            requestTypeDistribution,
            requestStatusStats,
            topNavieras,
        };
    }
}
