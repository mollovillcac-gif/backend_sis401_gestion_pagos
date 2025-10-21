import { IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

type OrderDirection = 'ASC' | 'DESC';

export class GetSortParamstDto {
    @IsOptional()
    @Type(() => String)
    @IsString()
    @ApiProperty({
        required: false,
        description: 'El orden solicitado para los registros (por defecto: ASC)',
    })
    sord?: OrderDirection = 'ASC';

    @IsOptional()
    @Type(() => String)
    @IsString()
    @ApiProperty({
        required: false,
        description: 'El id de la columna solicitada para ordenar los registros',
    })
    sidx?: string;
}
