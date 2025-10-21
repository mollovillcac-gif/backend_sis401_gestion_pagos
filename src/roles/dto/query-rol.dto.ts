import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GetPaginationSortParamsDto } from 'src/common/dto/get-pagination-sort-params.dto';

export class QueryRolDto extends GetPaginationSortParamsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly nombre?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    readonly descripcion?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined) return undefined;
        return value === 'true' || value === true;
    })
    readonly activo?: boolean;
}
