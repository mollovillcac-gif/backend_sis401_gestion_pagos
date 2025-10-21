import { PartialType } from '@nestjs/swagger';
import { CreateNavieraDto } from './create-naviera.dto';

export class UpdateNavieraDto extends PartialType(CreateNavieraDto) {}
// Se recomienda que el controlador siempre reciba usuarioId para auditoría
