import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

/**
 * Controlador para servir archivos estáticos
 */
@ApiTags('Files')
@Controller('uploads')
export class FilesController {
    @Get(':filename')
    @ApiOperation({ summary: 'Obtener archivo por nombre' })
    @ApiParam({ name: 'filename', description: 'Nombre del archivo' })
    @ApiResponse({ status: 200, description: 'Archivo encontrado' })
    @ApiResponse({ status: 404, description: 'Archivo no encontrado' })
    async getFile(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(process.cwd(), 'uploads', filename);

        // Verificar que el archivo existe
        if (!existsSync(filePath)) {
            throw new NotFoundException('Archivo no encontrado');
        }

        // Verificar que el archivo está dentro del directorio uploads por seguridad
        if (!filePath.startsWith(join(process.cwd(), 'uploads'))) {
            throw new NotFoundException('Archivo no encontrado');
        }

        return res.sendFile(filePath);
    }

    @Get('comprobantes/:filename')
    @ApiOperation({ summary: 'Obtener comprobante por nombre' })
    @ApiParam({ name: 'filename', description: 'Nombre del comprobante' })
    @ApiResponse({ status: 200, description: 'Comprobante encontrado' })
    @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
    async getComprobante(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(process.cwd(), 'uploads', 'comprobantes', filename);

        // Verificar que el archivo existe
        if (!existsSync(filePath)) {
            throw new NotFoundException('Comprobante no encontrado');
        }

        // Verificar que el archivo está dentro del directorio uploads/comprobantes por seguridad
        if (!filePath.startsWith(join(process.cwd(), 'uploads', 'comprobantes'))) {
            throw new NotFoundException('Comprobante no encontrado');
        }

        return res.sendFile(filePath);
    }

    @Get('facturas/:filename')
    @ApiOperation({ summary: 'Obtener factura por nombre' })
    @ApiParam({ name: 'filename', description: 'Nombre de la factura' })
    @ApiResponse({ status: 200, description: 'Factura encontrada' })
    @ApiResponse({ status: 404, description: 'Factura no encontrada' })
    async getFactura(@Param('filename') filename: string, @Res() res: Response) {
        const filePath = join(process.cwd(), 'uploads', 'facturas', filename);

        // Verificar que el archivo existe
        if (!existsSync(filePath)) {
            throw new NotFoundException('Factura no encontrada');
        }

        // Verificar que el archivo está dentro del directorio uploads/facturas por seguridad
        if (!filePath.startsWith(join(process.cwd(), 'uploads', 'facturas'))) {
            throw new NotFoundException('Factura no encontrada');
        }

        return res.sendFile(filePath);
    }
}
