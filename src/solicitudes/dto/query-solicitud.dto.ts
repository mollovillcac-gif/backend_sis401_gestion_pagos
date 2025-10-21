import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';
import { TiposSolicitud, EstadosSolicitudes } from 'src/common/enum';

export class QuerySolicitudDto extends GetPaginationSortParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por BL (Bill of Lading)',
    })
    @IsOptional()
    @IsString({ message: 'El BL debe ser una cadena de texto' })
    readonly bl?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por número de contenedor',
    })
    @IsOptional()
    @IsString({ message: 'El contenedor debe ser una cadena de texto' })
    readonly contenedor?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por tipo de solicitud',
        enum: TiposSolicitud,
    })
    @IsOptional()
    @IsEnum(TiposSolicitud, {
        message: 'El tipo debe ser gatein, demora, liberacion o giros',
    })
    readonly tipo?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por estado de la solicitud',
        enum: EstadosSolicitudes,
    })
    @IsOptional()
    @IsEnum(EstadosSolicitudes, {
        message: 'El estado debe ser pendiente, subido, verificada, pagada o anulada',
    })
    readonly estado?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly documento?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly tipoDocumento?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de usuario',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'El ID del usuario debe ser un número' })
    readonly usuarioId?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de naviera',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'El ID de la naviera debe ser un número' })
    readonly navieraId?: number;

    @ApiPropertyOptional({
        description: 'Filtrar solicitudes del día anterior (true para obtener solo del día anterior)',
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean({ message: 'El parámetro solicitudesPasadas debe ser un valor booleano' })
    readonly solicitudesPasadas?: boolean;

    @ApiPropertyOptional({
        description: 'Filtrar solicitudes de hoy (true para obtener solo las de hoy)',
    })
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean({ message: 'El parámetro solicitudesHoy debe ser un valor booleano' })
    readonly solicitudesHoy?: boolean;
}
