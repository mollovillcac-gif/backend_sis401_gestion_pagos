import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { EstadosSolicitudes } from 'src/common/enum';

export class ChangeStateDto {
    @ApiProperty({
        description: 'Nuevo estado de la solicitud',
        enum: EstadosSolicitudes,
        example: 'verificada',
    })
    @IsString({ message: 'El estado debe ser una cadena de texto' })
    @IsEnum(EstadosSolicitudes, {
        message: 'El estado debe ser pendiente, subido, verificada, pagada o anulada',
    })
    readonly estado: string;
}
