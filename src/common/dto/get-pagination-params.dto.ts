import { IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetPaginationParamsDto {
    @IsOptional()
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({}, { message: 'La página debe ser un número' })
    @ApiProperty({
        required: false,
        default: 1,
        description: 'Número de página (por defecto: 1)',
    })
    page?: number = 1;

    @IsOptional()
    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({}, { message: 'El limit debe ser un número' })
    @ApiProperty({
        required: false,
        default: 20,
        description: 'Límite de resultados por página (por defecto: 20)',
    })
    limit?: number = 20;
}
