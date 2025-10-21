import { BaseEntity } from 'src/common/entities/base-entity';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('configuraciones')
export class Configuracion extends BaseEntity {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column('decimal', { name: 'comision_porcentaje', precision: 5, scale: 2, default: 3.0 })
    comisionPorcentaje: number; // Comisión en porcentaje (ej: 3.00)

    @Column('decimal', { name: 'tipo_cambio_usd', precision: 10, scale: 2, default: 6.96 })
    tipoCambioUSD: number; // Tipo de cambio del USD a Bs

    @Column('decimal', { name: 'tipo_cambio_clp', precision: 10, scale: 5, default: 0.008 })
    tipoCambioCLP: number; // Tipo de cambio del CLP a Bs
}
