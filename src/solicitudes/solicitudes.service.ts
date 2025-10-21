import {
    ConflictException,
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { join, extname } from 'path';
import { existsSync } from 'fs';
import { Solicitud } from './entities/solicitud.entity';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { QuerySolicitudDto } from './dto/query-solicitud.dto';
import { FilesUploadResponseDto } from './dto/upload-files.dto';
import { Tarifa } from 'src/tarifas/entities/tarifa.entity';
import { Configuracion } from 'src/configuraciones/entities/configuracion.entity';
import { Naviera } from 'src/navieras/entities/naviera.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { TiposSolicitud, EstadosSolicitudes, Roles } from 'src/common/enum';
import { FileService } from 'src/common/services/file.service';

@Injectable()
export class SolicitudesService {
    constructor(
        @InjectRepository(Solicitud)
        private readonly solicitudesRepository: Repository<Solicitud>,
        @InjectRepository(Tarifa)
        private readonly tarifasRepository: Repository<Tarifa>,
        @InjectRepository(Configuracion)
        private readonly configuracionesRepository: Repository<Configuracion>,
        @InjectRepository(Naviera)
        private readonly navierasRepository: Repository<Naviera>,
        @InjectRepository(Usuario)
        private readonly usuariosRepository: Repository<Usuario>,
        private readonly fileService: FileService
    ) {}

    async create(createSolicitudDto: CreateSolicitudDto, usuarioId: number): Promise<Solicitud> {
        const { bl, contenedor, navieraId, documento, tipoDocumento, tipo } = createSolicitudDto;

        // Verificar que el usuario existe
        const usuario = await this.usuariosRepository.findOneBy({
            id: usuarioId,
        });

        if (!usuario) {
            throw new NotFoundException('El usuario especificado no existe');
        }

        // Verificar que la naviera existe
        const naviera = await this.navierasRepository.findOneBy({
            id: navieraId,
        });

        if (!naviera) {
            throw new NotFoundException('La naviera especificada no existe');
        }

        // Verificar si ya existe una solicitud con el mismo BL y contenedor (solo si BL y contenedor no son null)
        // if (contenedor) { //podriamos haber validado tambien lo que es el BL pero no es obligatorio que sea unico
        //     const existe = await this.solicitudesRepository.findOneBy({
        //         bl: bl.trim(),
        //         contenedor: contenedor.trim(),
        //     });

        //     if (existe) {
        //         throw new ConflictException('Ya existe una solicitud con el mismo BL y contenedor');
        //     }
        // }
        // === Unicidad de CONTENEDOR por día ===
        if (contenedor) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(startOfDay);
            endOfDay.setHours(23, 59, 59, 999);

            const existeContenedorHoy = await this.solicitudesRepository
                .createQueryBuilder('s')
                .where('s.contenedor = :contenedor', { contenedor: contenedor.trim() })
                .andWhere('s.fechaCreacion BETWEEN :start AND :end', {
                    start: startOfDay,
                    end: endOfDay,
                })
                .getOne();

            if (existeContenedorHoy) {
                throw new ConflictException('Ya existe una solicitud HOY con este contenedor');
            }
        }

        // Nota: NO se valida BL; puede repetirse

        // Obtener todas las configuraciones (aunque normalmente solo hay una)
        const configuraciones = await this.configuracionesRepository.find();
        if (configuraciones.length === 0) {
            throw new NotFoundException('Configuración global no encontrada');
        }
        const config = configuraciones[0]; // Usar el primer registro

        let montoBase = 0;
        let comision = 0;
        let tipoCambioCLPD = 0;
        let valorBs = 0;
        let y = 0;
        let z = 0;
        let totalFinalBs = 0;
        let detalleCalculo = {};

        // Lógica para tipo GATEIN: buscar tarifa según naviera
        if (tipo === TiposSolicitud.GATEIN) {
            const tarifa = await this.tarifasRepository.findOne({
                where: { naviera: { id: navieraId } },
                relations: ['naviera'],
            });
            if (!tarifa) {
                throw new NotFoundException(
                    `No se encontró tarifa para la naviera ${naviera.nombre}`
                );
            }
            comision = Number(config.comisionPorcentaje) / 100;
            tipoCambioCLPD = Number(config.tipoCambioCLP) / 1000;

            // Calcular total final
            montoBase = Number(tarifa.montoBase) + 6000;
            valorBs = Number(montoBase) * Number(tipoCambioCLPD); // Corregido: multiplicar en lugar de dividir
            z = Number(valorBs) * Number(comision);
            totalFinalBs = Number(z) + Number(valorBs);

            detalleCalculo = {
                tipo: 'GATEIN',
                tarifaBase: Number(tarifa.montoBase),
                incremento: 6000,
                montoBaseCLP: montoBase,
                tipoCambioCLP: Number(config.tipoCambioCLP),
                valorBs: valorBs,
                comisionPorcentaje: Number(config.comisionPorcentaje),
                comisionMonto: z,
                totalFinal: totalFinalBs,
            };
        }

        // 🔷 Para DEMORA o LIBERACION → convertir monto USD a Bs y calcular comisión
        else if (tipo === TiposSolicitud.DEMORA || tipo === TiposSolicitud.LIBERACION) {
            const montoUSD = createSolicitudDto.monto;

            if (montoUSD === undefined || isNaN(Number(montoUSD))) {
                throw new ConflictException('Debe ingresar un monto estimado válido en USD');
            }

            comision = config.comisionPorcentaje / 100;
            y = Number(montoUSD) * comision;
            z = Number(y) + Number(montoUSD);
            montoBase = Number(z) * config.tipoCambioUSD; // Convertir monto USD a Bs
            totalFinalBs = montoBase + 50;

            detalleCalculo = {
                tipo: tipo,
                montoUSD: Number(montoUSD),
                comisionPorcentaje: Number(config.comisionPorcentaje),
                comisionUSD: y,
                totalUSD: z,
                tipoCambioUSD: Number(config.tipoCambioUSD),
                montoBaseBs: montoBase,
                incremento: 50,
                totalFinal: totalFinalBs,
            };
        }

        // Crear y guardar la solicitud
        const solicitud = this.solicitudesRepository.create({
            usuario: usuario,
            bl: bl ? bl.trim() : null,
            contenedor: contenedor ? contenedor.trim() : null,
            naviera: naviera,
            documento: documento ? documento.trim() : null,
            tipoDocumento: tipoDocumento ? tipoDocumento.trim() : null,
            tipo: tipo,
            totalFinalBs: totalFinalBs,
            montoBase: montoBase,
            comisionPorcentaje: comision * 100, // Guardar como porcentaje
            comisionMonto: z,
            tipoCambioUsado:
                tipo === TiposSolicitud.GATEIN ? config.tipoCambioCLP : config.tipoCambioUSD,
            detalleCalculo: JSON.stringify(detalleCalculo),
            estado: EstadosSolicitudes.PENDIENTE,
            comprobantePago: null,
            factura: null,
            creadoPor: usuarioId,
        });

        return this.solicitudesRepository.save(solicitud);
    }

    async findAll(q: QuerySolicitudDto) {
        const {
            page = 1,
            limit = 20,
            bl,
            contenedor,
            tipo,
            estado,
            documento,
            tipoDocumento,
            usuarioId,
            navieraId,
            solicitudesPasadas,
            solicitudesHoy,
            sidx,
            sord,
        } = q;
        const query = this.solicitudesRepository
            .createQueryBuilder('solicitudes')
            .select([
                'solicitudes.id',
                'solicitudes.bl',
                'solicitudes.contenedor',
                'solicitudes.documento',
                'solicitudes.tipoDocumento',
                'solicitudes.tipo',
                'solicitudes.estado',
                'solicitudes.totalFinalBs',
                'solicitudes.montoBase',
                'solicitudes.comisionPorcentaje',
                'solicitudes.comisionMonto',
                'solicitudes.tipoCambioUsado',
                'solicitudes.detalleCalculo',
                'solicitudes.comprobantePago',
                'solicitudes.factura',
                'solicitudes.dress',
                'solicitudes.fechaCreacion',
                'solicitudes.fechaModificacion',
            ])
            .leftJoinAndSelect('solicitudes.naviera', 'naviera')
            .leftJoinAndSelect('solicitudes.usuario', 'usuario');

        if (bl) {
            query.andWhere('solicitudes.bl ILIKE :bl', {
                bl: `%${bl}%`,
            });
        }

        if (contenedor) {
            query.andWhere('solicitudes.contenedor ILIKE :contenedor', {
                contenedor: `%${contenedor}%`,
            });
        }

        if (tipo) {
            query.andWhere('solicitudes.tipo = :tipo', { tipo });
        }

        if (documento) {
            query.andWhere('solicitudes.documento ILIKE :documento', {
                documento: `%${documento}%`,
            });
        }

        if (tipoDocumento) {
            query.andWhere('solicitudes.tipoDocumento ILIKE :tipoDocumento', {
                tipoDocumento: `%${tipoDocumento}%`,
            });
        }

        if (estado) {
            query.andWhere('solicitudes.estado = :estado', { estado });
        }

        if (usuarioId) {
            query.andWhere('solicitudes.usuario.id = :usuarioId', { usuarioId });
        }

        if (navieraId) {
            query.andWhere('solicitudes.naviera.id = :navieraId', { navieraId });
        }

        // Filtro para solicitudes del día anterior
        if (solicitudesPasadas) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0); // Inicio del día anterior

            const endOfYesterday = new Date(yesterday);
            endOfYesterday.setHours(23, 59, 59, 999); // Final del día anterior

            query.andWhere(
                'solicitudes.fechaCreacion >= :startDate AND solicitudes.fechaCreacion <= :endDate',
                {
                    startDate: yesterday,
                    endDate: endOfYesterday,
                }
            );
        }

        // Filtro para solicitudes de hoy
        if (solicitudesHoy) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Inicio del día actual

            const endOfToday = new Date(today);
            endOfToday.setHours(23, 59, 59, 999); // Final del día actual

            query.andWhere(
                'solicitudes.fechaCreacion >= :startDateToday AND solicitudes.fechaCreacion <= :endDateToday',
                {
                    startDateToday: today,
                    endDateToday: endOfToday,
                }
            );
        }

        if (sidx) {
            query.orderBy(`solicitudes.${sidx}`, sord);
        }

        const [result, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: result,
            total,
            page,
            pageCount: Math.ceil(total / limit),
        };
    }

    /**
     * Obtiene todas las solicitudes creadas hoy
     */
    async findSolicitudesHoy(q: QuerySolicitudDto = {}) {
        const {
            page = 1,
            limit = 20,
            sidx = 'fechaCreacion',
            sord = 'DESC',
            usuarioId,
            bl,
            contenedor,
            tipo,
            estado,
            documento,
            tipoDocumento,
            navieraId,
        } = q;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día actual

        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999); // Final del día actual

        const query = this.solicitudesRepository
            .createQueryBuilder('solicitudes')
            .select([
                'solicitudes.id',
                'solicitudes.bl',
                'solicitudes.contenedor',
                'solicitudes.documento',
                'solicitudes.tipoDocumento',
                'solicitudes.tipo',
                'solicitudes.estado',
                'solicitudes.totalFinalBs',
                'solicitudes.montoBase',
                'solicitudes.comisionPorcentaje',
                'solicitudes.comisionMonto',
                'solicitudes.tipoCambioUsado',
                'solicitudes.detalleCalculo',
                'solicitudes.comprobantePago',
                'solicitudes.factura',
                'solicitudes.dress',
                'solicitudes.fechaCreacion',
                'solicitudes.fechaModificacion',
            ])
            .leftJoinAndSelect('solicitudes.naviera', 'naviera')
            .leftJoinAndSelect('solicitudes.usuario', 'usuario')
            .where(
                'solicitudes.fechaCreacion >= :startDate AND solicitudes.fechaCreacion <= :endDate',
                {
                    startDate: today,
                    endDate: endOfToday,
                }
            );

        // Aplicar filtros adicionales
        if (usuarioId) {
            query.andWhere('solicitudes.usuario.id = :usuarioId', { usuarioId });
        }

        if (bl) {
            query.andWhere('solicitudes.bl ILIKE :bl', { bl: `%${bl}%` });
        }

        if (contenedor) {
            query.andWhere('solicitudes.contenedor ILIKE :contenedor', {
                contenedor: `%${contenedor}%`,
            });
        }

        if (tipo) {
            query.andWhere('solicitudes.tipo = :tipo', { tipo });
        }

        if (estado) {
            query.andWhere('solicitudes.estado = :estado', { estado });
        }

        if (documento) {
            query.andWhere('solicitudes.documento ILIKE :documento', {
                documento: `%${documento}%`,
            });
        }

        if (tipoDocumento) {
            query.andWhere('solicitudes.tipoDocumento ILIKE :tipoDocumento', {
                tipoDocumento: `%${tipoDocumento}%`,
            });
        }

        if (navieraId) {
            query.andWhere('solicitudes.naviera.id = :navieraId', { navieraId });
        }

        query.orderBy(`solicitudes.${sidx}`, sord);

        const [result, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: result,
            total,
            page,
            pageCount: Math.ceil(total / limit),
            fechaFiltro: {
                desde: today,
                hasta: endOfToday,
                descripcion: 'Solicitudes de hoy',
            },
        };
    }

    /**
     * Obtiene todas las solicitudes creadas el día anterior
     */
    async findSolicitudesPasadas(q: QuerySolicitudDto = {}) {
        const { page = 1, limit = 20, sidx = 'fechaCreacion', sord = 'DESC' } = q;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); // Inicio del día anterior

        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999); // Final del día anterior

        const query = this.solicitudesRepository
            .createQueryBuilder('solicitudes')
            .select([
                'solicitudes.id',
                'solicitudes.bl',
                'solicitudes.contenedor',
                'solicitudes.documento',
                'solicitudes.tipoDocumento',
                'solicitudes.tipo',
                'solicitudes.estado',
                'solicitudes.totalFinalBs',
                'solicitudes.montoBase',
                'solicitudes.comisionPorcentaje',
                'solicitudes.comisionMonto',
                'solicitudes.tipoCambioUsado',
                'solicitudes.detalleCalculo',
                'solicitudes.comprobantePago',
                'solicitudes.factura',
                'solicitudes.fechaCreacion',
                'solicitudes.fechaModificacion',
            ])
            .leftJoinAndSelect('solicitudes.naviera', 'naviera')
            .leftJoinAndSelect('solicitudes.usuario', 'usuario')
            .where(
                'solicitudes.fechaCreacion >= :startDate AND solicitudes.fechaCreacion <= :endDate',
                {
                    startDate: yesterday,
                    endDate: endOfYesterday,
                }
            )
            .orderBy(`solicitudes.${sidx}`, sord);

        const [result, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: result,
            total,
            page,
            pageCount: Math.ceil(total / limit),
            fechaFiltro: {
                desde: yesterday,
                hasta: endOfYesterday,
                descripcion: 'Solicitudes del día anterior',
            },
        };
    }

    /**
     * Obtiene todas las solicitudes históricas (anteriores a hoy)
     */
    async findHistorialSolicitudes(q: QuerySolicitudDto = {}) {
        const {
            page = 1,
            limit = 20,
            sidx = 'fechaCreacion',
            sord = 'DESC',
            usuarioId,
            bl,
            contenedor,
            tipo,
            estado,
            documento,
            tipoDocumento,
            navieraId,
        } = q;

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Inicio del día actual

        const query = this.solicitudesRepository
            .createQueryBuilder('solicitudes')
            .select([
                'solicitudes.id',
                'solicitudes.bl',
                'solicitudes.contenedor',
                'solicitudes.documento',
                'solicitudes.tipoDocumento',
                'solicitudes.tipo',
                'solicitudes.estado',
                'solicitudes.totalFinalBs',
                'solicitudes.montoBase',
                'solicitudes.comisionPorcentaje',
                'solicitudes.comisionMonto',
                'solicitudes.tipoCambioUsado',
                'solicitudes.detalleCalculo',
                'solicitudes.comprobantePago',
                'solicitudes.factura',
                'solicitudes.fechaCreacion',
                'solicitudes.fechaModificacion',
            ])
            .leftJoinAndSelect('solicitudes.naviera', 'naviera')
            .leftJoinAndSelect('solicitudes.usuario', 'usuario')
            .where('solicitudes.fechaCreacion < :today', {
                today: today,
            });

        // Aplicar filtros adicionales
        if (usuarioId) {
            query.andWhere('solicitudes.usuario.id = :usuarioId', { usuarioId });
        }

        if (bl) {
            query.andWhere('solicitudes.bl ILIKE :bl', { bl: `%${bl}%` });
        }

        if (contenedor) {
            query.andWhere('solicitudes.contenedor ILIKE :contenedor', {
                contenedor: `%${contenedor}%`,
            });
        }

        if (tipo) {
            query.andWhere('solicitudes.tipo = :tipo', { tipo });
        }

        if (estado) {
            query.andWhere('solicitudes.estado = :estado', { estado });
        }

        if (documento) {
            query.andWhere('solicitudes.documento ILIKE :documento', {
                documento: `%${documento}%`,
            });
        }

        if (tipoDocumento) {
            query.andWhere('solicitudes.tipoDocumento ILIKE :tipoDocumento', {
                tipoDocumento: `%${tipoDocumento}%`,
            });
        }

        if (navieraId) {
            query.andWhere('solicitudes.naviera.id = :navieraId', { navieraId });
        }

        query.orderBy(`solicitudes.${sidx}`, sord);

        const [result, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: result,
            total,
            page,
            pageCount: Math.ceil(total / limit),
            fechaFiltro: {
                hasta: today,
                descripcion: 'Historial de solicitudes (anteriores a hoy)',
            },
        };
    }

    private validateStateTransition(
        currentState: string,
        newState: string,
        userRole: string
    ): boolean {
        const validTransitions = {
            [EstadosSolicitudes.PENDIENTE]: [
                EstadosSolicitudes.SUBIDO, // Cliente sube comprobante
                EstadosSolicitudes.ANULADA, // Admin puede anular
            ],
            [EstadosSolicitudes.SUBIDO]: [
                EstadosSolicitudes.VERIFICADA, // Admin verifica
                EstadosSolicitudes.ANULADA, // Admin puede anular
            ],
            [EstadosSolicitudes.VERIFICADA]: [
                EstadosSolicitudes.PAGADA, // Admin marca como pagada
                EstadosSolicitudes.ANULADA, // Admin puede anular
            ],
            [EstadosSolicitudes.PAGADA]: [
                EstadosSolicitudes.ANULADA, // Solo admin puede anular pagadas
            ],
            [EstadosSolicitudes.ANULADA]: [], // Estado final, no se puede cambiar
        };

        // Admin puede hacer cualquier transición válida
        if (userRole === Roles.ADMIN) {
            return validTransitions[currentState]?.includes(newState) || false;
        }

        // Cliente solo puede pasar de PENDIENTE a SUBIDO (al subir comprobante)
        if (userRole === Roles.CLIENTE) {
            return (
                currentState === EstadosSolicitudes.PENDIENTE &&
                newState === EstadosSolicitudes.SUBIDO
            );
        }

        return false;
    }

    async changeState(id: number, newState: string, usuarioId: number): Promise<Solicitud> {
        const solicitud = await this.findOne(id);
        const usuario = await this.usuariosRepository.findOne({
            where: { id: usuarioId },
            relations: ['rol'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Validar permisos
        if (solicitud.usuario.id !== usuarioId && usuario.rol.nombre !== Roles.ADMIN) {
            throw new ForbiddenException(
                'No tienes permisos para cambiar el estado de esta solicitud'
            );
        }

        // Validar transición de estado
        if (!this.validateStateTransition(solicitud.estado, newState, usuario.rol.nombre)) {
            throw new BadRequestException(
                `No se puede cambiar el estado de '${solicitud.estado}' a '${newState}'`
            );
        }

        // Actualizar estado
        solicitud.estado = newState;
        return this.solicitudesRepository.save(solicitud);
    }

    async findOne(id: number): Promise<Solicitud> {
        const solicitud = await this.solicitudesRepository.findOne({
            where: { id },
            relations: ['naviera', 'usuario'],
        });
        if (!solicitud) {
            throw new NotFoundException('Solicitud no encontrada');
        }
        return solicitud;
    }

    async update(
        id: number,
        updateSolicitudDto: UpdateSolicitudDto,
        usuarioId?: number
    ): Promise<Solicitud> {
        const solicitud = await this.findOne(id);

        // Verificar permisos si se proporciona usuarioId
        // if (usuarioId && solicitud.usuario.id !== usuarioId) {
        //     const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
        //     if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
        //         throw new ForbiddenException('No tienes permisos para actualizar esta solicitud');
        //     }
        // }

        // Bloquear edición si el comprobante ya fue subido y el usuario no es admin
        if (usuarioId && solicitud.usuario.id === usuarioId && solicitud.comprobantePago) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException(
                    'No puedes editar la solicitud después de subir el comprobante de pago'
                );
            }
        }

        // Obtener configuraciones globales
        const configuraciones = await this.configuracionesRepository.find();
        if (configuraciones.length === 0) {
            throw new NotFoundException('Configuración global no encontrada');
        }
        const config = configuraciones[0];

        // Obtener naviera actualizada si se modificó
        let naviera = solicitud.naviera;
        if (updateSolicitudDto.navieraId && updateSolicitudDto.navieraId !== solicitud.naviera.id) {
            naviera = await this.navierasRepository.findOneBy({ id: updateSolicitudDto.navieraId });
            if (!naviera) {
                throw new NotFoundException('La naviera especificada no existe');
            }
        }

        // Recalcular montos y totales
        let montoBase = solicitud.montoBase;
        let comision = solicitud.comisionPorcentaje / 100;
        let tipoCambioCLPD = 0;
        let valorBs = 0;
        let y = 0;
        let z = 0;
        let totalFinalBs = solicitud.totalFinalBs;
        let detalleCalculo = {};
        const tipo = updateSolicitudDto.tipo || solicitud.tipo;

        if (tipo === TiposSolicitud.GATEIN) {
            const tarifa = await this.tarifasRepository.findOne({
                where: { naviera: { id: naviera.id } },
                relations: ['naviera'],
            });
            if (!tarifa) {
                throw new NotFoundException(
                    `No se encontró tarifa para la naviera ${naviera.nombre}`
                );
            }
            comision = Number(config.comisionPorcentaje) / 100;
            tipoCambioCLPD = Number(config.tipoCambioCLP) / 1000;
            montoBase = Number(tarifa.montoBase) + 6000;
            valorBs = Number(montoBase) * Number(tipoCambioCLPD); // Corregido: multiplicar en lugar de dividir
            z = Number(valorBs) * Number(comision);
            totalFinalBs = Number(z) + Number(valorBs);
            detalleCalculo = {
                tipo: 'GATEIN',
                tarifaBase: Number(tarifa.montoBase),
                incremento: 6000,
                montoBaseCLP: montoBase,
                tipoCambioCLP: Number(config.tipoCambioCLP),
                valorBs: valorBs,
                comisionPorcentaje: Number(config.comisionPorcentaje),
                comisionMonto: z,
                totalFinal: totalFinalBs,
            };
        } else if (tipo === TiposSolicitud.DEMORA || tipo === TiposSolicitud.LIBERACION) {
            const detallePrevio = solicitud.detalleCalculo
                ? JSON.parse(String(solicitud.detalleCalculo))
                : null;
            const montoUSD =
                updateSolicitudDto.monto !== undefined
                    ? Number(updateSolicitudDto.monto)
                    : Number(detallePrevio?.montoUSD); // <- aquí el fallback correcto
            
            if (montoUSD === undefined || isNaN(montoUSD)) {
                throw new ConflictException('Debe ingresar un monto estimado válido en USD');
            }

            comision = config.comisionPorcentaje / 100; // Asegurarse de usar la comisión actualizada
            y = Number(montoUSD) * comision; // Comisión en USD
            z = Number(y) + Number(montoUSD); // Total en USD
            montoBase = Number(z) * config.tipoCambioUSD;   // Convertir monto USD a Bs
            totalFinalBs = montoBase + 50; // Incremento fijo
            
            detalleCalculo = {
                tipo: tipo,
                montoUSD: Number(montoUSD),
                comisionPorcentaje: Number(config.comisionPorcentaje),
                comisionUSD: y,
                totalUSD: z,
                tipoCambioUSD: Number(config.tipoCambioUSD),
                montoBaseBs: montoBase,
                incremento: 50,
                totalFinal: totalFinalBs,
            };
        }

        const solicitudActualizada = Object.assign(solicitud, updateSolicitudDto, {
            naviera: naviera,
            montoBase: montoBase,
            comisionPorcentaje: comision * 100,
            comisionMonto: z,
            tipoCambioUsado:
                tipo === TiposSolicitud.GATEIN ? config.tipoCambioCLP : config.tipoCambioUSD,
            detalleCalculo: JSON.stringify(detalleCalculo),
            totalFinalBs: totalFinalBs,
            modificadoPor: usuarioId,
        });
        return this.solicitudesRepository.save(solicitudActualizada);
    }

    async remove(id: number, usuarioId?: number): Promise<Solicitud> {
        const solicitud = await this.findOne(id);

        // Verificar permisos si se proporciona usuarioId
        if (usuarioId && solicitud.usuario.id !== usuarioId) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException('No tienes permisos para eliminar esta solicitud');
            }
        }

        // Eliminar archivos asociados antes de eliminar la solicitud
        if (solicitud.comprobantePago) {
            this.fileService.deleteFile(solicitud.comprobantePago);
        }
        if (solicitud.factura) {
            this.fileService.deleteFile(solicitud.factura);
        }

        solicitud.eliminadoPor = usuarioId;
        this.solicitudesRepository.save(solicitud); // Guardar el usuario que elimina
        return this.solicitudesRepository.softRemove(solicitud);
    }

    async getStats(usuarioId?: number) {
        const queryBuilder = this.solicitudesRepository.createQueryBuilder('solicitud');

        // Si se proporciona usuarioId, filtrar por usuario (para clientes)
        if (usuarioId) {
            queryBuilder.where('solicitud.usuario.id = :usuarioId', { usuarioId });
        }

        const [total, pendientes, subidas, verificadas, pagadas, anuladas] = await Promise.all([
            queryBuilder.getCount(),
            queryBuilder
                .clone()
                .andWhere('solicitud.estado = :estado', { estado: EstadosSolicitudes.PENDIENTE })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('solicitud.estado = :estado', { estado: EstadosSolicitudes.SUBIDO })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('solicitud.estado = :estado', { estado: EstadosSolicitudes.VERIFICADA })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('solicitud.estado = :estado', { estado: EstadosSolicitudes.PAGADA })
                .getCount(),
            queryBuilder
                .clone()
                .andWhere('solicitud.estado = :estado', { estado: EstadosSolicitudes.ANULADA })
                .getCount(),
        ]);

        // Estadísticas por tipo
        const statsQuery = this.solicitudesRepository
            .createQueryBuilder('solicitud')
            .select('solicitud.tipo', 'tipo')
            .addSelect('COUNT(*)', 'cantidad')
            .addSelect('SUM(solicitud.totalFinalBs)', 'montoTotal');

        if (usuarioId) {
            statsQuery.where('solicitud.usuario.id = :usuarioId', { usuarioId });
        }

        const statsByType = await statsQuery.groupBy('solicitud.tipo').getRawMany();

        return {
            resumen: {
                total,
                pendientes,
                subidas,
                verificadas,
                pagadas,
                anuladas,
            },
            porTipo: statsByType.map((stat) => ({
                tipo: stat.tipo,
                cantidad: parseInt(stat.cantidad),
                montoTotal: parseFloat(stat.montoTotal) || 0,
            })),
        };
    }

    async uploadFiles(
        id: number,
        files: { comprobantePago?: Express.Multer.File[]; factura?: Express.Multer.File[] },
        usuarioId: number
    ): Promise<FilesUploadResponseDto> {
        const solicitud = await this.findOne(id);

        // Verificar permisos
        if (solicitud.usuario.id !== usuarioId) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException(
                    'No tienes permisos para subir archivos a esta solicitud'
                );
            }
        }

        const updateData: Partial<Solicitud> = {};
        const response: FilesUploadResponseDto = {
            message: 'Archivos procesados correctamente',
        };

        // Procesar comprobante de pago
        if (files.comprobantePago && files.comprobantePago[0]) {
            const comprobante = files.comprobantePago[0];

            // Eliminar archivo anterior si existe
            if (solicitud.comprobantePago) {
                this.fileService.deleteFile(solicitud.comprobantePago);
            }

            // Validar y actualizar
            const filename = this.fileService.validateFile(comprobante);
            updateData.comprobantePago = filename;
            response.comprobantePago = filename;
        }

        // Procesar factura
        if (files.factura && files.factura[0]) {
            const factura = files.factura[0];

            // Eliminar archivo anterior si existe
            if (solicitud.factura) {
                this.fileService.deleteFile(solicitud.factura);
            }

            // Validar y actualizar
            const filename = this.fileService.validateFile(factura);
            updateData.factura = filename;
            response.factura = filename;
        }

        // Verificar que al menos un archivo fue subido
        if (!files.comprobantePago && !files.factura) {
            throw new BadRequestException('Debe proporcionar al menos un archivo');
        }

        // Actualizar la solicitud
        await this.solicitudesRepository.update(id, updateData);

        return response;
    }

    async uploadComprobante(
        id: number,
        file: Express.Multer.File,
        usuarioId: number
    ): Promise<{ comprobantePago: string; message: string }> {
        if (!file) {
            throw new BadRequestException('Debe proporcionar un archivo de comprobante');
        }

        const solicitud = await this.findOne(id);

        // Verificar permisos
        if (solicitud.usuario.id !== usuarioId) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException(
                    'No tienes permisos para subir archivos a esta solicitud'
                );
            }
        }

        // Validar que la solicitud esté en estado PENDIENTE para subir comprobante
        if (solicitud.estado !== EstadosSolicitudes.PENDIENTE) {
            throw new BadRequestException(
                'Solo se puede subir comprobante a solicitudes en estado PENDIENTE'
            );
        }

        // Eliminar archivo anterior si existe
        if (solicitud.comprobantePago) {
            this.fileService.deleteFile(`comprobantes/${solicitud.comprobantePago}`);
        }

        // Validar archivo
        const filename = this.fileService.validateFile(file);

        // Actualizar la base de datos con el comprobante y cambiar estado a SUBIDO
        await this.solicitudesRepository.update(id, {
            comprobantePago: filename,
            estado: EstadosSolicitudes.SUBIDO,
        });

        return {
            comprobantePago: filename,
            message: 'Comprobante de pago subido correctamente. Estado cambiado a SUBIDO.',
        };
    }

    async uploadFactura(
        id: number,
        file: Express.Multer.File,
        usuarioId: number
    ): Promise<{ factura: string; message: string }> {
        if (!file) {
            throw new BadRequestException('Debe proporcionar un archivo de factura');
        }

        const solicitud = await this.findOne(id);
        const usuario = await this.usuariosRepository.findOne({
            where: { id: usuarioId },
            relations: ['rol'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Solo admin puede subir facturas
        if (usuario.rol.nombre !== Roles.ADMIN) {
            throw new ForbiddenException('Solo los administradores pueden subir facturas');
        }

        // Validar que la solicitud esté en estado VERIFICADA para subir factura
        if (solicitud.estado !== EstadosSolicitudes.VERIFICADA) {
            throw new BadRequestException(
                'Solo se puede subir factura a solicitudes en estado VERIFICADA'
            );
        }

        // Eliminar archivo anterior si existe
        if (solicitud.factura) {
            this.fileService.deleteFile(`facturas/${solicitud.factura}`);
        }

        // Validar archivo
        const filename = this.fileService.validateFile(file);

        // Actualizar la base de datos con la factura y cambiar estado a PAGADA
        await this.solicitudesRepository.update(id, {
            factura: filename,
            estado: EstadosSolicitudes.PAGADA,
        });

        return {
            factura: filename,
            message: 'Factura subida correctamente. Estado cambiado a PAGADA.',
        };
    }

    async downloadComprobante(id: number, usuarioId: number, res: Response): Promise<void> {
        const solicitud = await this.findOne(id);

        // Verificar permisos
        if (solicitud.usuario.id !== usuarioId) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException(
                    'No tienes permisos para descargar archivos de esta solicitud'
                );
            }
        }

        // Verificar que existe el comprobante
        if (!solicitud.comprobantePago) {
            throw new NotFoundException('Esta solicitud no tiene comprobante de pago');
        }

        // Construir la ruta del archivo
        const filePath = join(process.cwd(), 'uploads', 'comprobantes', solicitud.comprobantePago);

        // Verificar que el archivo existe físicamente
        if (!existsSync(filePath)) {
            throw new NotFoundException('El archivo del comprobante no fue encontrado');
        }

        // Detectar el tipo MIME basado en la extensión
        const ext = extname(solicitud.comprobantePago).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
        }

        // Configurar headers para descarga
        const originalName = `comprobante_solicitud_${id}${ext}`;
        res.setHeader('Content-Type', contentType);

        // Usar res.download para forzar la descarga con nombre correcto
        res.download(filePath, originalName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                if (!res.headersSent) {
                    res.status(500).send('Error downloading file');
                }
            }
        });
    }

    async viewComprobante(id: number, usuarioId: number, res: Response): Promise<void> {
        const solicitud = await this.findOne(id);

        // Verificar que existe el comprobante
        if (!solicitud.comprobantePago) {
            throw new NotFoundException('Esta solicitud no tiene comprobante de pago');
        }

        // Construir la ruta del archivo
        const filePath = join(process.cwd(), 'uploads', 'comprobantes', solicitud.comprobantePago);

        // Verificar que el archivo existe físicamente
        if (!existsSync(filePath)) {
            throw new NotFoundException('El archivo del comprobante no fue encontrado');
        }

        // Detectar el tipo MIME basado en la extensión
        const ext = extname(solicitud.comprobantePago).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
        }

        // Configurar headers para visualización (no descarga)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

        // Enviar el archivo para visualización
        res.sendFile(filePath);
    }

    async downloadFactura(id: number, usuarioId: number, res: Response): Promise<void> {
        const solicitud = await this.findOne(id);

        // Verificar permisos
        if (solicitud.usuario.id !== usuarioId) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException(
                    'No tienes permisos para descargar archivos de esta solicitud'
                );
            }
        }

        // Verificar que existe la factura
        if (!solicitud.factura) {
            throw new NotFoundException('Esta solicitud no tiene factura');
        }

        // Construir la ruta del archivo
        const filePath = join(process.cwd(), 'uploads', 'facturas', solicitud.factura);

        // Verificar que el archivo existe físicamente
        if (!existsSync(filePath)) {
            throw new NotFoundException('El archivo de la factura no fue encontrado');
        }

        // Detectar el tipo MIME basado en la extensión
        const ext = extname(solicitud.factura).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
        }

        // Configurar headers para descarga
        const originalName = `factura_solicitud_${id}${ext}`;
        res.setHeader('Content-Type', contentType);

        // Usar res.download para forzar la descarga con nombre correcto
        res.download(filePath, originalName, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
                if (!res.headersSent) {
                    res.status(500).send('Error downloading file');
                }
            }
        });
    }

    async viewFactura(id: number, usuarioId: number, res: Response): Promise<void> {
        const solicitud = await this.findOne(id);

        // Verificar que existe la factura
        if (!solicitud.factura) {
            throw new NotFoundException('Esta solicitud no tiene factura');
        }

        // Construir la ruta del archivo
        const filePath = join(process.cwd(), 'uploads', 'facturas', solicitud.factura);

        // Verificar que el archivo existe físicamente
        if (!existsSync(filePath)) {
            throw new NotFoundException('El archivo de la factura no fue encontrado');
        }

        // Detectar el tipo MIME basado en la extensión
        const ext = extname(solicitud.factura).toLowerCase();
        let contentType = 'application/octet-stream';

        switch (ext) {
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.gif':
                contentType = 'image/gif';
                break;
            case '.webp':
                contentType = 'image/webp';
                break;
            case '.pdf':
                contentType = 'application/pdf';
                break;
        }

        // Configurar headers para visualización (no descarga)
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache por 1 hora

        // Enviar el archivo para visualización
        res.sendFile(filePath);
    }

    async uploadDress(id: number, file: Express.Multer.File, usuarioId: number) {
        const solicitud = await this.solicitudesRepository.findOne({ where: { id } });
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        // Permitir solo al propietario o admin
        if (solicitud.usuario.id !== usuarioId) {
            throw new ForbiddenException('No tienes permisos para subir el archivo DRESS');
        }
        // Si ya existe dress, eliminar el anterior
        if (solicitud.dress) {
            this.fileService.deleteFile(`dress/${solicitud.dress}`);
        }
        solicitud.dress = file.filename;
        await this.solicitudesRepository.save(solicitud);
        return {
            dress: file.filename,
            message: 'Archivo DRESS subido correctamente',
        };
    }

    async downloadDress(id: number, usuarioId: number, res: Response) {
        const solicitud = await this.solicitudesRepository.findOne({ where: { id } });
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (!solicitud.dress)
            throw new NotFoundException('No existe archivo DRESS para esta solicitud');
        const filePath = join(process.cwd(), 'uploads', 'dress', solicitud.dress);
        if (!existsSync(filePath))
            throw new NotFoundException('Archivo DRESS no encontrado en el servidor');
        return res.download(filePath, solicitud.dress);
    }

    async viewDress(id: number, usuarioId: number, res: Response) {
        const solicitud = await this.solicitudesRepository.findOne({ where: { id } });
        if (!solicitud) throw new NotFoundException('Solicitud no encontrada');
        if (!solicitud.dress)
            throw new NotFoundException('No existe archivo DRESS para esta solicitud');
        const filePath = join(process.cwd(), 'uploads', 'dress', solicitud.dress);
        if (!existsSync(filePath))
            throw new NotFoundException('Archivo DRESS no encontrado en el servidor');
        return res.sendFile(filePath);
    }

    async deleteFile(
        id: number,
        fileType: 'comprobantePago' | 'factura',
        usuarioId: number
    ): Promise<{ message: string }> {
        const solicitud = await this.findOne(id);

        // Verificar permisos
        if (solicitud.usuario.id !== usuarioId) {
            const usuario = await this.usuariosRepository.findOneBy({ id: usuarioId });
            if (!usuario || usuario.rol.nombre !== Roles.ADMIN) {
                throw new ForbiddenException(
                    'No tienes permisos para eliminar archivos de esta solicitud'
                );
            }
        }

        // Verificar que el archivo existe
        const filename = solicitud[fileType];
        if (!filename) {
            throw new NotFoundException(`No hay ${fileType} asociado a esta solicitud`);
        }

        // Eliminar archivo del sistema de archivos
        this.fileService.deleteFile(filename);

        // Actualizar la base de datos
        const updateData = { [fileType]: null };
        await this.solicitudesRepository.update(id, updateData);

        return {
            message: `${fileType === 'comprobantePago' ? 'Comprobante de pago' : 'Factura'} eliminado correctamente`,
        };
    }
}
