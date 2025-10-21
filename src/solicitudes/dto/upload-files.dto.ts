import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateSolicitudFilesDto {
  @ApiProperty({
    description: 'Archivo de comprobante de pago (imagen o PDF)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  comprobantePago?: Express.Multer.File;

  @ApiProperty({
    description: 'Archivo de factura (imagen o PDF)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  factura?: Express.Multer.File;
}

export class FilesUploadResponseDto {
  @ApiProperty({
    description: 'URL del comprobante de pago subido',
    example: 'http://localhost:3000/uploads/comprobante-123.jpg',
    required: false,
  })
  comprobantePago?: string;

  @ApiProperty({
    description: 'URL de la factura subida',
    example: 'http://localhost:3000/uploads/factura-456.pdf',
    required: false,
  })
  factura?: string;

  @ApiProperty({
    description: 'Mensaje de éxito',
    example: 'Archivos subidos correctamente',
  })
  message: string;
}
