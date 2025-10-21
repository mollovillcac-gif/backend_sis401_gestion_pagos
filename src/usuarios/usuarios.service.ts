import {
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Rol } from 'src/roles/entities/rol.entity';
import { QueryUsuarioDto } from './dto/query-usuario.dto';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectRepository(Usuario)
        private usuariosRepository: Repository<Usuario>,
        @InjectRepository(Rol)
        private rolesRepository: Repository<Rol>
    ) {}

    async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
        const { usuario, nombre, apellido, telefono, correo, activo, rolId } = createUsuarioDto;

        const existe = await this.usuariosRepository.findOneBy({
            usuario: usuario.trim(),
        });
        if (existe) throw new ConflictException('El usuario ya existe');

        const rol = await this.rolesRepository.findOneBy({ id: rolId });
        if (!rol) throw new NotFoundException('El rol especificado no existe');

        const nuevoUsuario = this.usuariosRepository.create({
            usuario: usuario.trim(),
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            correo: correo?.trim() || undefined,
            telefono: telefono?.trim() || undefined,
            activo,
            clave: createUsuarioDto.clave,
            rolId,
            ultimoLogin: new Date(),
            creadoPor: createUsuarioDto.usuarioId,
        });
        return this.usuariosRepository.save(nuevoUsuario);
    }

    async findAll(q: QueryUsuarioDto) {
        const {
            page = 1,
            limit = 20,
            rolId,
            usuario,
            nombre,
            apellido,
            telefono,
            correo,
            activo,
            sidx,
            sord,
        } = q;
        const query = this.usuariosRepository
            .createQueryBuilder('usuarios')
            .select([
                'usuarios.id',
                'usuarios.usuario',
                'usuarios.nombre',
                'usuarios.apellido',
                'usuarios.correo',
                'usuarios.telefono',
                'usuarios.activo',
                'usuarios.ultimoLogin',
                'usuarios.rolId',
                'usuarios.fechaCreacion',
                'usuarios.fechaModificacion',
            ])
            .leftJoinAndSelect('usuarios.rol', 'rol');

        if (usuario) {
            query.andWhere('usuarios.usuario ILIKE :usuario', {
                usuario: `%${usuario}%`,
            });
        }

        if (nombre) {
            query.andWhere('usuarios.nombre ILIKE :nombre', {
                nombre: `%${nombre}%`,
            });
        }

        if (apellido) {
            query.andWhere('usuarios.apellido ILIKE :apellido', {
                apellido: `%${apellido}%`,
            });
        }

        if (correo) {
            query.andWhere('usuarios.correo ILIKE :correo', {
                correo: `%${correo}%`,
            });
        }

        if (telefono) {
            query.andWhere('usuarios.telefono ILIKE :telefono', {
                telefono: `%${telefono}%`,
            });
        }

        if (activo !== undefined) {
            query.andWhere('usuarios.activo = :activo', {
                activo,
            });
        }

        if (rolId) {
            query.andWhere('usuarios.rolId = :rolId', {
                rolId,
            });
        }

        if (sidx) {
            query.orderBy(`usuarios.${sidx}`, sord);
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

    async findOne(id: number): Promise<Usuario> {
        const usuario = await this.usuariosRepository.findOne({
            where: { id },
            select: [
                'id',
                'usuario',
                'nombre',
                'apellido',
                'correo',
                'telefono',
                'clave',
                'activo',
                'ultimoLogin',
                'rolId',
            ],
            relations: ['rol'],
        });

        if (!usuario) {
            throw new NotFoundException('El usuario no existe');
        }

        return usuario;
    }

    async findByEmail(correo: string): Promise<Usuario | null> {
        return await this.usuariosRepository.findOne({
            where: { correo: correo },
        });
    }

    async update(
        id: number,
        updateUsuarioDto: UpdateUsuarioDto
    ): Promise<{ message: string; usuario: Usuario }> {
        const usuario = await this.findOne(id);

        if (updateUsuarioDto.usuario) {
            const existe = await this.usuariosRepository.findOne({
                where: { usuario: updateUsuarioDto.usuario.trim() },
            });

            if (existe && existe.id !== id) {
                throw new ConflictException('El usuario ya existe');
            }
        }

        const normalizedUsuarioDto = {
            ...updateUsuarioDto,
            usuario: updateUsuarioDto.usuario?.trim(),
            nombre: updateUsuarioDto.nombre?.trim(),
            apellido: updateUsuarioDto.apellido?.trim(),
            correo: updateUsuarioDto.correo?.trim() || undefined,
            telefono: updateUsuarioDto.telefono?.trim() || undefined,
        };

        if (normalizedUsuarioDto.rolId) {
            const rol = await this.rolesRepository.findOneBy({ id: normalizedUsuarioDto.rolId });
            if (!rol) throw new NotFoundException('El rol especificado no existe');
            usuario.rol = rol;
        }

        Object.assign(usuario, normalizedUsuarioDto, {
            modificadoPor: updateUsuarioDto.usuarioId,
        });
        const updatedUsuario = await this.usuariosRepository.save(usuario);
        return { message: 'Usuario actualizado correctamente', usuario: updatedUsuario };
    }

    async remove(id: number, usuarioId: number): Promise<{ message: string }> {
        const usuario = await this.findOne(id);
        usuario.eliminadoPor = usuarioId;
        usuario.activo = false;
        await this.usuariosRepository.save(usuario);
        await this.usuariosRepository.softRemove(usuario);
        return { message: 'Usuario eliminado correctamente' };
    }

    async validate(usuario: string, clave: string): Promise<Usuario> {
        const usuarioOk = await this.usuariosRepository.findOne({
            where: { usuario },
            select: ['id', 'usuario', 'nombre', 'correo', 'clave', 'activo', 'ultimoLogin'],
        });

        if (!usuarioOk) throw new NotFoundException('Usuario inexistente');
        if (!usuarioOk.activo) throw new UnauthorizedException('Usuario inactivo, contacte al administrador para su activación.');

        const claveValida = await usuarioOk.validatePassword(clave);
        if (!claveValida) throw new UnauthorizedException('Clave incorrecta');

        usuarioOk.ultimoLogin = new Date();
        await this.usuariosRepository.save(usuarioOk);

        // Remove password from response
        const { clave: password, ...usuarioWithoutPassword } = usuarioOk;
        return usuarioWithoutPassword as Usuario;
    }

    async updatePassword(userId: number, hashedPassword: string): Promise<void> {
        await this.usuariosRepository.update(userId, { clave: hashedPassword });
    }

    async resetPassword(id: number): Promise<{ message: string }> {
        await this.findOne(id);

        const hashedDefaultPassword = await bcrypt.hash(process.env.DEFAULT_PASSWORD, 10);

        await this.updatePassword(id, hashedDefaultPassword);

        return { message: 'Contraseña restablecida exitosamente' };
    }
}
