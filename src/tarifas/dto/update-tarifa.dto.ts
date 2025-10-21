import { PartialType } from '@nestjs/swagger';
import { CreateTarifaDto } from './create-tarifa.dto';

export class UpdateTarifaDto extends PartialType(CreateTarifaDto) {}
// Se recomienda que el controlador siempre reciba usuarioId para auditoría
