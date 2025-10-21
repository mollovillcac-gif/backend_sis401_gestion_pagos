import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateConfiguracionDto {
  @ApiProperty({
    example: 1,
    description: 'ID del usuario que realiza la acción',
  })
  @IsNotEmpty({ message: 'El usuarioId es obligatorio para auditoría' })
  readonly usuarioId: number;
  
  @ApiProperty({ description: 'Porcentaje de comisión', example: 3.0 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'La comisión debe ser un número' })
  @Min(0)
  @Type(() => Number)
  readonly comisionPorcentaje: number;

  @ApiProperty({ description: 'Tipo de cambio de USD a BOB', example: 6.96 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'El tipo de cambio USD debe ser un número' })
  @Min(0)
  @Type(() => Number)
  readonly tipoCambioUSD: number;

  @ApiProperty({ description: 'Tipo de cambio de CLP a BOB', example: 0.008 })
  @IsNotEmpty()
  @IsNumber({}, { message: 'El tipo de cambio CLP debe ser un número' })
  @Min(0)
  @Type(() => Number)
  readonly tipoCambioCLP: number;
}
// Esta clase DTO define la estructura de los datos necesarios para crear una nueva configuración en el sistema.
// Utiliza decoradores de validación para asegurar que los datos sean correctos antes de ser
