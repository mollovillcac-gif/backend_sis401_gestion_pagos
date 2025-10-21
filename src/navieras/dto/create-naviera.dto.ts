import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNavieraDto {
    @ApiProperty({
        example: 1,
        description: 'ID del usuario que realiza la acción',
    })
    @IsNotEmpty({ message: 'El usuarioId es obligatorio para auditoría' })
    readonly usuarioId: number;
    
    @ApiProperty({
        example: 'Maersk Line',
        description: 'Nombre de la naviera, debe ser único y descriptivo',
    })
    @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
    @IsString({ message: 'El campo nombre debe ser de tipo string' })
    @MaxLength(100, {
        message: 'El campo nombre no debe ser mayor a 100 caracteres',
    })
    readonly nombre: string;

    @ApiProperty({
        example: 'Naviera internacional especializada en transporte de contenedores',
        description: 'Descripción breve de la naviera',
    })
    @IsOptional()
    @IsString({ message: 'El campo descripcion debe ser de tipo string' })
    @MaxLength(250, {
        message: 'El campo descripcion no debe ser mayor a 250 caracteres',
    })
    readonly descripcion?: string;

    @ApiProperty({
        example: true,
        description: 'Estado activo de la naviera',
    })
    @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
    @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
    readonly activo: boolean;
}
