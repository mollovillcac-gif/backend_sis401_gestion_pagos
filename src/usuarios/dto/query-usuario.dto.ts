import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryUsuarioDto extends GetPaginationSortParamsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly usuario?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly nombre?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly apellido?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly correo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly telefono?: string;

    @ApiPropertyOptional()
    @IsOptional()
    readonly rolId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined) return undefined;
        return value === 'true' || value === true;
    })
    readonly activo?: boolean;
}
