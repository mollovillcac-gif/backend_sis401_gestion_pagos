import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, IsNumber, Min, IsString, IsBoolean } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryTarifaDto extends GetPaginationSortParamsDto {
    @ApiPropertyOptional({
        description: 'Filtrar por nombre de naviera',
    })
    @IsOptional()
    @IsString({ message: 'El nombre de naviera debe ser una cadena de texto' })
    readonly naviera?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por ID de naviera',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'El ID de naviera debe ser un número' })
    readonly navieraId?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por monto base mínimo',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'El monto mínimo debe ser un número' })
    @Min(0, { message: 'El monto mínimo debe ser mayor o igual a 0' })
    readonly montoMinimo?: number;

    @ApiPropertyOptional({
        description: 'Filtrar por monto base máximo',
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'El monto máximo debe ser un número' })
    @Min(0, { message: 'El monto máximo debe ser mayor o igual a 0' })
    readonly montoMaximo?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined) return undefined;
        return value === 'true' || value === true;
    })
    readonly activo?: boolean;
}
