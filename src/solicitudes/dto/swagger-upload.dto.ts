import { ApiProperty } from '@nestjs/swagger';

export class UploadFilesSwaggerDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Archivo de comprobante de pago (JPEG, PNG, GIF, WebP, PDF)',
    required: false,
    example: 'comprobante.jpg',
  })
  comprobantePago?: any;

  @ApiProperty({
    type: 'string', 
    format: 'binary',
    description: 'Archivo de factura (JPEG, PNG, GIF, WebP, PDF)',
    required: false,
    example: 'factura.pdf',
  })
  factura?: any;
}