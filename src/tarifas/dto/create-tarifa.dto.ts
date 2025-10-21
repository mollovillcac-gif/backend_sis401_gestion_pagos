import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTarifaDto {
    @ApiProperty({
        example: 1,
        description: 'ID del usuario que realiza la acción',
    })
    @IsNotEmpty({ message: 'El usuarioId es obligatorio para auditoría' })
    readonly usuarioId: number;
    
    @ApiProperty({
        description: 'ID de la naviera asociada a la tarifa',
        example: 1,
    })
    @IsNotEmpty({ message: 'El campo navieraId es obligatorio' })
    @IsNumber({}, { message: 'El campo navieraId debe ser un número' })
    @Type(() => Number)
    readonly navieraId: number;

    @ApiProperty({
        description: 'Monto base de la tarifa en bolivianos',
        example: 700,
    })
    @IsNotEmpty({ message: 'El campo montoBase es obligatorio' })
    @IsNumber({}, { message: 'El campo montoBase debe ser un número' })
    @Min(0, { message: 'El montoBase debe ser mayor o igual a 0' })
    @Type(() => Number)
    readonly montoBase: number;

    @ApiProperty({
        example: true,
        description: 'Estado activo de la tarifa',
    })
    @IsNotEmpty({ message: 'El campo activo no debe ser vacío' })
    @IsBoolean({ message: 'El campo activo debe ser de tipo booleano' })
    readonly activo: boolean;
}
