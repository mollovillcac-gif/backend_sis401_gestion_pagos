import { BaseEntity } from 'src/common/entities/base-entity';
import { Naviera } from 'src/navieras/entities/naviera.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tarifas')
export class Tarifa extends BaseEntity {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @ManyToOne(() => Naviera, (naviera) => naviera.tarifas)
    @JoinColumn({ name: 'naviera_id' })
    naviera: Naviera;

    @Column('decimal', { name: 'monto_base', precision: 10, scale: 2 })
    montoBase: number;

    @Column('boolean', { default: true })
    activo: boolean;
}
