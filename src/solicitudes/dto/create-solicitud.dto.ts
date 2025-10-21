import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsEnum,
    IsNumber,
    IsOptional,
    IsNotEmpty,
    MaxLength,
    Min,
    ValidateIf,
} from 'class-validator';
import { EstadosSolicitudes, TiposDocumentoCliente, TiposSolicitud } from 'src/common/enum';

export class CreateSolicitudDto {
    @ApiProperty({
        description: 'Número de BL (Bill of Lading)',
        example: 'BL123456',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El campo BL debe ser una cadena de texto' })
    @MaxLength(100, { message: 'El campo BL debe tener un máximo de 100 caracteres' })
    readonly bl?: string;

    @ApiProperty({
        description: 'Número de contenedor',
        example: 'CONT123456',
    })
    @IsNotEmpty({ message: 'El campo contenedor es obligatorio' })
    @IsString({ message: 'El campo contenedor debe ser una cadena de texto' })
    @MaxLength(100, { message: 'El campo contenedor debe tener un máximo de 100 caracteres' })
    readonly contenedor: string;

    @ApiProperty({
        example: '12345678',
        description: 'Número de documento del usuario',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El campo documento debe ser tipo cadena' })
    @MaxLength(20, {
        message: 'El campo documento no debe ser mayor a 20 caracteres',
    })
    readonly documento?: string;
    @ApiProperty({
        example: TiposDocumentoCliente.CI,
        description: 'Tipo de documento del usuario',
        enum: TiposDocumentoCliente,
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El campo tipoDocumento debe ser tipo cadena' })
    @IsEnum(TiposDocumentoCliente, { message: 'El campo tipoDocumento debe ser un valor válido' })
    readonly tipoDocumento?: string;

    @ApiProperty({
        description: 'ID de la naviera',
        example: 1,
    })
    @IsNotEmpty({ message: 'El campo navieraId es obligatorio' })
    @IsNumber({}, { message: 'El campo navieraId debe ser un número' })
    @Type(() => Number)
    readonly navieraId: number;

    @ApiProperty({
        description: 'Tipo de solicitud (gatein, demora, liberacion o giros)',
        example: 'gatein',
        enum: TiposSolicitud,
    })
    @IsNotEmpty({ message: 'El tipo de solicitud es obligatorio' })
    @IsEnum(TiposSolicitud, {
        message: 'El tipo debe ser gatein, demora, liberacion o giros',
    })
    readonly tipo: string;

    @ApiProperty({
        description: 'Estado de la solicitud',
        example: 'pendiente',
        required: false,
    })
    @IsOptional()
    @IsEnum(EstadosSolicitudes, {
        message: 'El estado debe ser pendiente, anulada, subido, pagada o verificada',
    })
    @IsString({ message: 'El estado debe ser una cadena de texto' })
    readonly estado?: string;

    @ApiProperty({
        description: 'Monto de la solicitud (solo para tipos distintos a gatein)',
        example: 1000,
        required: false,
    })
    @ValidateIf((o) => o.tipo !== TiposSolicitud.GATEIN)
    @IsNotEmpty({ message: 'El monto es obligatorio si no es tipo gatein' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    @Min(0, { message: 'El monto debe ser mayor o igual a 0' })
    @Type(() => Number)
    readonly monto?: number;

    @ApiProperty({
        description: 'Total final de la solicitud (calculado automáticamente)',
        example: 1100,
        required: false,
    })
    @IsOptional()
    @IsNumber({}, { message: 'El total final debe ser un número' })
    @Min(0, { message: 'El total final debe ser mayor o igual a 0' })
    @Type(() => Number)
    readonly totalFinal?: number;
}
