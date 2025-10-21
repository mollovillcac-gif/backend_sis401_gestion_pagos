import { PartialType } from '@nestjs/swagger';
import { CreateConfiguracionDto } from './create-configuracion.dto';

export class UpdateConfiguracionDto extends PartialType(CreateConfiguracionDto) {}
// Se recomienda que el controlador siempre reciba usuarioId para auditoría
