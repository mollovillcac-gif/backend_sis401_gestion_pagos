import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base-entity';
import { Tarifa } from 'src/tarifas/entities/tarifa.entity';
import { Solicitud } from 'src/solicitudes/entities/solicitud.entity';

@Entity('navieras')
export class Naviera extends BaseEntity {
    @Column('varchar', { length: 100 })
    nombre: string;

    @Column('varchar', { length: 250, nullable: true })
    descripcion?: string;

    @Column('boolean', { default: true })
    activo: boolean;

    @OneToMany(() => Tarifa, (tarifa) => tarifa.naviera)
    tarifas: Tarifa[];

    @OneToMany(() => Solicitud, (solicitud) => solicitud.naviera)
    solicitudes: Solicitud[];
}
