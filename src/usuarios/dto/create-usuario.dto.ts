import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDefined,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class CreateUsuarioDto {
    @ApiProperty({
        example: 1,
        description: 'ID del usuario que realiza la acción',
    })
    @IsNotEmpty({ message: 'El usuarioId es obligatorio para auditoría' })
    readonly usuarioId: number;

    @ApiProperty({
        example: 'jdoe',
        description: 'Nombre de usuario único para el sistema',
    })
    @IsNotEmpty({ message: 'El campo usuario es obligatorio' })
    @IsString({ message: 'El campo usuario debe ser tipo cadena' })
    @MaxLength(20, {
        message: 'El campo usuario no debe ser mayor a 20 caracteres',
    })
    readonly usuario: string;

    @ApiProperty({
        example: 'John',
        description: 'Nombre del usuario',
    })
    @IsNotEmpty({ message: 'El campo nombre es obligatorio' })
    @IsString({ message: 'El campo nombre debe ser tipo cadena' })
    @MaxLength(100, {
        message: 'El campo nombre no debe ser mayor a 100 caracteres',
    })
    @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
        message: 'El nombre solo puede contener letras y espacios',
    })
    readonly nombre: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Apellido del usuario',
    })
    @IsNotEmpty({ message: 'El campo apellido es obligatorio' })
    @IsString({ message: 'El campo apellido debe ser tipo cadena' })
    @MaxLength(100, {
        message: 'El campo apellido no debe ser mayor a 100 caracteres',
    })
    @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
        message: 'El apellido solo puede contener letras y espacios',
    })
    readonly apellido: string;

    @ApiProperty({
        example: 'johndoe@example.com',
        description: 'Correo electrónico del usuario',
    })
    @IsOptional()
    @IsString({ message: 'El campo correo debe ser de tipo cadena' })
    @IsEmail({}, { message: 'El campo correo debe ser un correo electrónico válido' })
    @MaxLength(255, {
        message: 'El campo correo no debe ser mayor a 255 caracteres',
    })
    readonly correo?: string;

    @ApiProperty({
        example: '71234567890',
        description: 'Número de teléfono del usuario (11 dígitos)',
    })
    @IsOptional()
    @IsString({ message: 'El campo teléfono debe ser una cadena' })
    @Matches(/^[0-9]{11}$/, { message: 'El número de teléfono debe tener exactamente 11 dígitos' })
    readonly telefono?: string;

    @ApiProperty({
        example: 'securepassword123',
        description: 'Contraseña del usuario',
    })
    @IsNotEmpty({ message: 'El campo clave es obligatorio' })
    @IsString({ message: 'El campo clave debe ser tipo cadena' })
    @MaxLength(255, {
        message: 'El campo clave no debe ser mayor a 255 caracteres',
    })
    readonly clave: string;

    @ApiProperty({
        example: true,
        description: 'Estado activo del usuario',
    })
    @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
    @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
    readonly activo: boolean;

    @ApiProperty({
        example: 1,
        description: 'ID del rol asignado al usuario',
    })
    @IsNotEmpty({ message: 'El campo rol_id es obligatorio' })
    @IsDefined({ message: 'El campo rol_id debe estar definido' })
    @IsNumber({}, { message: 'El campo rol_id debe ser de tipo numérico' })
    readonly rolId: number;
}
