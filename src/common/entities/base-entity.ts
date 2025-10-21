import {
    CreateDateColumn,
    Column,
    BeforeUpdate,
    PrimaryGeneratedColumn,
    DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('identity')
    id: number;

    @Column({ name: 'creado_por', type: 'int', nullable: true })
    creadoPor?: number;

    @Column({ name: 'modificado_por', type: 'int', nullable: true })
    modificadoPor?: number;

    @Column({ name: 'eliminado_por', type: 'int', nullable: true })
    eliminadoPor?: number;

    @CreateDateColumn({
        name: 'fecha_creacion',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    fechaCreacion: Date;

    @Column({
        name: 'fecha_modificacion',
        type: 'timestamp',
        nullable: true,
        default: null,
    })
    fechaModificacion?: Date;

    @BeforeUpdate()
    updateFechaModificacion?() {
        this.fechaModificacion = new Date();
    }

    @DeleteDateColumn({ name: 'fecha_eliminacion', select: false })
    fechaEliminacion?: Date;
}
