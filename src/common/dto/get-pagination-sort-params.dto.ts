import { IntersectionType } from '@nestjs/swagger';
import { GetPaginationParamsDto } from './get-pagination-params.dto';
import { GetSortParamstDto } from './get-sort-params.dto';

export class GetPaginationSortParamsDto extends IntersectionType(
    GetPaginationParamsDto,
    GetSortParamstDto
) {}
