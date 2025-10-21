import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNavieraDto } from './dto/create-naviera.dto';
import { UpdateNavieraDto } from './dto/update-naviera.dto';
import { QueryNavieraDto } from './dto/query-naviera.dto';
import { Naviera } from './entities/naviera.entity';
import { Tarifa } from 'src/tarifas/entities/tarifa.entity';
import { Solicitud } from 'src/solicitudes/entities/solicitud.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NavierasService {
    constructor(
        @InjectRepository(Naviera)
        private navierasRepository: Repository<Naviera>,
        @InjectRepository(Tarifa)
        private tarifasRepository: Repository<Tarifa>,
        @InjectRepository(Solicitud)
        private solicitudesRepository: Repository<Solicitud>
    ) {}

    async create(createNavieraDto: CreateNavieraDto): Promise<Naviera> {
        const naviera = await this.navierasRepository.findOne({
            where: {
                nombre: createNavieraDto.nombre.toLowerCase(),
            },
        });
        if (naviera) throw new ConflictException('Ya existe una naviera con ese nombre');
        // Se recomienda pasar el usuarioId como argumento en el controlador
        const newNaviera = this.navierasRepository.create({
            nombre: createNavieraDto.nombre.trim(),
            descripcion: createNavieraDto.descripcion?.trim() || undefined,
            activo: createNavieraDto.activo,
            creadoPor: createNavieraDto.usuarioId,
        });
        return this.navierasRepository.save(newNaviera);
    }

    async findAll(q: QueryNavieraDto) {
        const { page = 1, limit = 20, nombre, descripcion, activo, sidx, sord } = q;
        const query = this.navierasRepository
            .createQueryBuilder('navieras')
            .select([
                'navieras.id',
                'navieras.nombre',
                'navieras.descripcion',
                'navieras.activo',
                'navieras.fechaCreacion',
                'navieras.fechaModificacion',
            ]);

        if (nombre) {
            query.andWhere('navieras.nombre ILIKE :nombre', {
                nombre: `%${nombre}%`,
            });
        }

        if (descripcion) {
            query.andWhere('navieras.descripcion ILIKE :descripcion', {
                descripcion: `%${descripcion}%`,
            });
        }

        if (activo !== undefined) {
            query.andWhere('navieras.activo = :activo', {
                activo,
            });
        }

        if (sidx) {
            query.orderBy(`navieras.${sidx}`, sord);
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

    async findOne(id: number): Promise<Naviera> {
        const naviera = await this.navierasRepository.findOneBy({ id });
        if (!naviera) throw new NotFoundException('La naviera con el id proporcionado no existe');
        return naviera;
    }

    async update(
        id: number,
        updateNavieraDto: UpdateNavieraDto
    ): Promise<{ message: string; naviera: Naviera }> {
        const naviera = await this.findOne(id);

        let updatedData = { ...updateNavieraDto };

        if (updateNavieraDto.nombre) {
            const existingNaviera = await this.navierasRepository.findOne({
                where: {
                    nombre: updateNavieraDto.nombre.toLowerCase().trim(),
                },
            });

            if (existingNaviera && existingNaviera.id !== id) {
                throw new ConflictException('Ya existe una naviera con ese nombre');
            }

            updatedData = {
                ...updatedData,
                nombre: updateNavieraDto.nombre.trim(),
            };
        }

        updatedData = {
            ...updatedData,
            descripcion: updateNavieraDto.descripcion?.trim() || undefined,
        };

        const navieraUpdate = Object.assign(naviera, updatedData, {
            modificadoPor: updateNavieraDto.usuarioId,
        });
        const updatedNaviera = await this.navierasRepository.save(navieraUpdate);

        return {
            message: 'La naviera ha sido actualizada exitosamente',
            naviera: updatedNaviera,
        };
    }

    async remove(id: number, usuarioId: number): Promise<{ message: string; naviera?: Naviera }> {
        const naviera = await this.findOne(id);

        // Verificamos si hay tarifas relacionadas a la naviera
        const tarifasCount = await this.tarifasRepository
            .createQueryBuilder('tarifa')
            .where('tarifa.naviera_id = :id', { id })
            .getCount();

        // Verificamos si hay solicitudes relacionadas a la naviera
        const solicitudesCount = await this.solicitudesRepository
            .createQueryBuilder('solicitud')
            .where('solicitud.naviera_id = :id', { id })
            .getCount();

        if (tarifasCount > 0 || solicitudesCount > 0) {
            throw new ConflictException(
                'No se puede eliminar la naviera porque está relacionada con tarifas o solicitudes'
            );
        }

        naviera.activo = false;
        naviera.eliminadoPor = usuarioId;
        await this.navierasRepository.save(naviera);
        return {
            message: 'La naviera ha sido inactivada exitosamente',
            naviera: naviera,
        };
    }
}
