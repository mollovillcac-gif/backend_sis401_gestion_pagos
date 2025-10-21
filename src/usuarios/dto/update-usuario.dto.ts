import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
// Se recomienda que el controlador siempre reciba usuarioId para auditoría
