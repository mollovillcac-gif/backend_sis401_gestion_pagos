import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuracion } from './entities/configuracion.entity';
import { CreateConfiguracionDto } from './dto/create-configuracion.dto';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';

@Injectable()
export class ConfiguracionesService {
  constructor(
    @InjectRepository(Configuracion)
    private readonly configuracionRepository: Repository<Configuracion>,
  ) {}

  // Crear configuración (normalmente una sola)
  async create(createDto: CreateConfiguracionDto): Promise<Configuracion> {
    const config = this.configuracionRepository.create({
      ...createDto,
      creadoPor: createDto.usuarioId,
    });
    return this.configuracionRepository.save(config);
  }

  // Obtener todas las configuraciones (aunque normalmente solo hay una)
  async findAll(): Promise<Configuracion[]> {
    return this.configuracionRepository.find();
  }

  // Obtener la configuración (por ID o fija en ID 1)
  async findOne(id: number = 1): Promise<Configuracion> {
    const config = await this.configuracionRepository.findOneBy({ id });
    if (!config) {
      throw new NotFoundException('Configuración no encontrada');
    }
    return config;
  }

  // Actualizar configuración
  async update(id: number, updateDto: UpdateConfiguracionDto): Promise<Configuracion> {
    const config = await this.findOne(id);
    const actualizada = Object.assign(config, updateDto, {
      modificadoPor: updateDto.usuarioId,
    });
    return this.configuracionRepository.save(actualizada);
  }
}
