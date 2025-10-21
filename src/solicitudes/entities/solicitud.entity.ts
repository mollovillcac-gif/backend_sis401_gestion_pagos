import { BaseEntity } from 'src/common/entities/base-entity';
import { EstadosSolicitudes, TiposSolicitud } from 'src/common/enum';
import { Naviera } from 'src/navieras/entities/naviera.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

@Entity('solicitudes')
export class Solicitud extends BaseEntity {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @ManyToOne(() => Usuario, { eager: true, nullable: false })
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @Column('varchar', { length: 100, nullable: true })
    bl: string;

    @Column('varchar', { length: 100 })
    contenedor: string;

    @ManyToOne(() => Naviera, (naviera) => naviera.solicitudes)
    @JoinColumn({ name: 'naviera_id' })
    naviera: Naviera;

    @Column('varchar', { length: 20, nullable: true })
    documento: string;

    @Column('varchar', { length: 20, name: 'tipo_documento', nullable: true })
    tipoDocumento: string;

    @Column('enum', {
        enum: TiposSolicitud,
        default: TiposSolicitud.GATEIN,
    })
    tipo: string;

    @Column('decimal', { name: 'total_final_bs', precision: 10, scale: 2 })
    totalFinalBs: number;

    // Nuevos campos para almacenar detalles de cálculos
    @Column('decimal', { name: 'monto_base', precision: 10, scale: 2, nullable: true })
    montoBase?: number;

    @Column('decimal', { name: 'comision_porcentaje', precision: 5, scale: 2, nullable: true })
    comisionPorcentaje?: number;

    @Column('decimal', { name: 'comision_monto', precision: 10, scale: 2, nullable: true })
    comisionMonto?: number;

    @Column('decimal', { name: 'tipo_cambio_usado', precision: 10, scale: 4, nullable: true })
    tipoCambioUsado?: number;

    @Column('text', { nullable: true })
    detalleCalculo?: string; // JSON con detalles del cálculo

    @Column('enum', {
        enum: EstadosSolicitudes,
        default: EstadosSolicitudes.PENDIENTE,
    })
    estado: string;

    @Column('varchar', { length: 255, nullable: true })
    comprobantePago?: string;

    @Column('varchar', { length: 255, nullable: true })
    factura?: string;

    @Column('varchar', { length: 255, nullable: true })
    dress?: string;
}
