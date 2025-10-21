import { Column, Entity, OneToMany } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { BaseEntity } from 'src/common/entities/base-entity';

@Entity('roles')
export class Rol extends BaseEntity {
    @Column('varchar', { length: 50 })
    nombre: string;

    @Column('varchar', { length: 250, nullable: true })
    descripcion?: string;

    @Column('boolean', { default: true })
    activo: boolean;

    @OneToMany(() => Usuario, (usuario) => usuario.rol)
    usuarios: Usuario[];
}
