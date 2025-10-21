import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifa } from './entities/tarifa.entity';
import { Naviera } from 'src/navieras/entities/naviera.entity';
import { CreateTarifaDto } from './dto/create-tarifa.dto';
import { UpdateTarifaDto } from './dto/update-tarifa.dto';
import { QueryTarifaDto } from './dto/query-tarifa.dto';

@Injectable()
export class TarifasService {
    constructor(
        @InjectRepository(Tarifa)
        private readonly tarifaRepository: Repository<Tarifa>,
        @InjectRepository(Naviera)
        private readonly navieraRepository: Repository<Naviera>
    ) {}

    // Crear nueva tarifa
    async create(createTarifaDto: CreateTarifaDto): Promise<Tarifa> {
        // Verificar que la naviera existe
        const naviera = await this.navieraRepository.findOneBy({
            id: createTarifaDto.navieraId,
        });

        if (!naviera) {
            throw new NotFoundException('La naviera especificada no existe');
        }

        // Verificar que no existe una tarifa para esta naviera
        const existe = await this.tarifaRepository.findOne({
            where: {
                naviera: { id: createTarifaDto.navieraId },
            },
        });

        if (existe) {
            throw new ConflictException('Ya existe una tarifa registrada para esta naviera');
        }

        const tarifa = this.tarifaRepository.create({
            naviera: naviera,
            montoBase: createTarifaDto.montoBase,
            activo: createTarifaDto.activo,
            creadoPor: createTarifaDto.usuarioId,
        });
        return this.tarifaRepository.save(tarifa);
    }

    // Listar todas las tarifas con filtros y paginación
    async findAll(q: QueryTarifaDto) {
        const {
            page = 1,
            limit = 20,
            naviera,
            navieraId,
            montoMinimo,
            montoMaximo,
            activo,
            sidx,
            sord,
        } = q;
        const query = this.tarifaRepository
            .createQueryBuilder('tarifas')
            .select([
                'tarifas.id',
                'tarifas.montoBase',
                'tarifas.activo',
                'tarifas.fechaCreacion',
                'tarifas.fechaModificacion',
            ])
            .leftJoinAndSelect('tarifas.naviera', 'naviera');

        if (naviera) {
            query.andWhere('naviera.nombre ILIKE :naviera', {
                naviera: `%${naviera}%`,
            });
        }

        if (navieraId) {
            query.andWhere('naviera.id = :navieraId', { navieraId });
        }

        if (montoMinimo !== undefined) {
            query.andWhere('tarifas.montoBase >= :montoMinimo', { montoMinimo });
        }

        if (montoMaximo !== undefined) {
            query.andWhere('tarifas.montoBase <= :montoMaximo', { montoMaximo });
        }

        if (activo !== undefined) {
            query.andWhere('tarifas.activo = :activo', {
                activo,
            });
        }

        if (sidx) {
            query.orderBy(`tarifas.${sidx}`, sord);
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

    // Buscar una tarifa por ID
    async findOne(id: number): Promise<Tarifa> {
        const tarifa = await this.tarifaRepository.findOne({
            where: { id },
            relations: ['naviera'],
        });
        if (!tarifa) {
            throw new NotFoundException('Tarifa no encontrada');
        }
        return tarifa;
    }

    // Actualizar tarifa
    async update(id: number, updateTarifaDto: UpdateTarifaDto): Promise<Tarifa> {
        const tarifa = await this.findOne(id);

        // Si se está actualizando la naviera, verificar que existe
        if (updateTarifaDto.navieraId) {
            const naviera = await this.navieraRepository.findOneBy({
                id: updateTarifaDto.navieraId,
            });

            if (!naviera) {
                throw new NotFoundException('La naviera especificada no existe');
            }

            tarifa.naviera = naviera;

            // Verificar que no existe una tarifa para esta naviera (excluyendo la actual)
            const existe = await this.tarifaRepository.findOne({
                where: {
                    naviera: { id: updateTarifaDto.navieraId },
                },
            });

            if (existe && existe.id !== id) {
                throw new ConflictException('Ya existe una tarifa registrada para esta naviera');
            }
        }

        if (updateTarifaDto.montoBase !== undefined) {
            tarifa.montoBase = updateTarifaDto.montoBase;
        }

        if (updateTarifaDto.activo !== undefined) {
            tarifa.activo = updateTarifaDto.activo;
        }

    tarifa.modificadoPor = updateTarifaDto.usuarioId;
    return this.tarifaRepository.save(tarifa);
    }

    // Eliminación lógica
    async remove(id: number, usuarioId: number): Promise<void> {
        const tarifa = await this.findOne(id);
        tarifa.activo = false;
        tarifa.eliminadoPor = usuarioId;
        await this.tarifaRepository.save(tarifa);
        await this.tarifaRepository.softRemove(tarifa);
    }
}
