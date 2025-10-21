import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRolDto {
    @ApiProperty({
        example: 1,
        description: 'ID del usuario que realiza la acción',
    })
    @IsNotEmpty({ message: 'El usuarioId es obligatorio para auditoría' })
    readonly usuarioId: number;

    @ApiProperty({
        example: 'Administrador',
        description: 'Nombre del rol, debe ser único y descriptivo',
    })
    @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
    @IsString({ message: 'El campo nombre debe ser de tipo string' })
    @MaxLength(50, {
        message: 'El campo nombre no debe ser mayor a 50 caracteres',
    })
    readonly nombre: string;

    @ApiProperty({
        example: 'Rol con acceso completo al sistema',
        description: 'Descripción breve del rol',
    })
    @IsOptional()
    @IsString({ message: 'El campo descripcion debe ser de tipo string' })
    @MaxLength(255, {
        message: 'El campo descripcion no debe ser mayor a 255 caracteres',
    })
    readonly descripcion?: string;

    @ApiProperty({
        example: true,
        description: 'Estado activo del rol',
    })
    @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
    @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
    readonly activo: boolean;
}
