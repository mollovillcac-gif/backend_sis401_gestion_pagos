import { BaseEntity } from 'src/common/entities/base-entity';
import * as bcrypt from 'bcrypt';
import {
    BeforeInsert,
    BeforeUpdate,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { Rol } from 'src/roles/entities/rol.entity';
import { Solicitud } from 'src/solicitudes/entities/solicitud.entity';

@Entity('usuarios')
export class Usuario extends BaseEntity {
    @Column('varchar', { length: 20 })
    usuario: string;

    @Column('varchar', { length: 100 })
    nombre: string;

    @Column('varchar', { length: 100 })
    apellido: string;

    @Column('varchar', { length: 255, nullable: true })
    correo?: string;

    @Column('varchar', { length: 20, nullable: true })
    telefono?: string;

    @Column('varchar', { length: 255, select: false })
    clave: string;

    @Column('boolean', { default: true })
    activo: boolean;

    @Column({
        name: 'ultimo_login',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    ultimoLogin: Date;

    @Column('number', { name: 'rol_id' })
    rolId: number;

    @ManyToOne(() => Rol, (rol) => rol.usuarios, { eager: true, nullable: false })
    @JoinColumn({ name: 'rol_id' })
    rol: Rol;

    @OneToMany(() => Solicitud, (solicitud) => solicitud.usuario)
    solicitudes: Solicitud[];

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.clave && !this.clave.startsWith('$2b$')) {
            const salt = await bcrypt.genSalt();
            this.clave = await bcrypt.hash(this.clave, salt);
        }
    }

    async validatePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.clave);
    }
}
