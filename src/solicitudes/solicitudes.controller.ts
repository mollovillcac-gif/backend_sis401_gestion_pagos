import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe,
    Res,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { SolicitudesService } from './solicitudes.service';
import { CreateSolicitudDto } from './dto/create-solicitud.dto';
import { UpdateSolicitudDto } from './dto/update-solicitud.dto';
import { QuerySolicitudDto } from './dto/query-solicitud.dto';
import { ChangeStateDto } from './dto/change-state.dto';
import {
    ApiBearerAuth,
    ApiTags,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { comprobantesMulterConfig, facturasMulterConfig } from 'src/common/config/multer.config';
import { dressMulterConfig } from 'src/common/config/multer.config';
import { FileService } from 'src/common/services/file.service';
import { FileInterceptor } from 'src/common/interceptors/file.interceptor';
import { Roles } from 'src/common/enum';

@ApiTags('Solicitudes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor)
@Controller('solicitudes')
export class SolicitudesController {
    constructor(
        private readonly solicitudesService: SolicitudesService,
        private readonly fileService: FileService
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva solicitud (solo datos)',
        description:
            'Crea una nueva solicitud sin archivos. Para subir archivos usar el endpoint POST /:id/upload-files',
    })
    @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    create(@Body() createSolicitudeDto: CreateSolicitudDto, @GetUser() user: Usuario) {
        return this.solicitudesService.create(createSolicitudeDto, user.id);
    }

    @Post(':id/comprobante')
    @ApiOperation({
        summary: 'Subir comprobante de pago',
        description: `Sube el comprobante de pago para una solicitud específica.

**Archivos soportados:**
- Imágenes: JPEG, PNG, GIF, WebP
- Documentos: PDF
- Tamaño máximo: 5MB

**Notas importantes:**
- Si ya existe un comprobante, será reemplazado
- Solo el propietario de la solicitud o un admin pueden subir archivos
- El archivo se guardará en /uploads/comprobantes/

**Ejemplo usando curl:**
\`\`\`bash
curl -X POST "http://localhost:3000/api/solicitudes/1/comprobante" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "comprobantePago=@/path/to/comprobante.jpg"
\`\`\``,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                comprobantePago: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo del comprobante de pago',
                },
            },
            required: ['comprobantePago'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Comprobante subido exitosamente',
        schema: {
            example: {
                comprobantePago: 'comprobante_abc123.jpg',
                message: 'Comprobante de pago subido correctamente',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Archivo inválido o no proporcionado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'comprobantePago', maxCount: 1 }], comprobantesMulterConfig)
    )
    async uploadComprobante(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: { comprobantePago?: Express.Multer.File[] },
        @GetUser() user: Usuario
    ) {
        try {
            console.log('Files received:', files);
            console.log('Files type:', typeof files);
            console.log('ComprobantePago files:', files?.comprobantePago);

            if (!files || !files.comprobantePago || !files.comprobantePago[0]) {
                throw new Error('No se recibió el archivo comprobantePago');
            }

            const result = await this.solicitudesService.uploadComprobante(
                id,
                files.comprobantePago[0],
                user.id
            );
            return result;
        } catch (error) {
            if (files?.comprobantePago?.[0]) {
                this.fileService.deleteFile(`comprobantes/${files.comprobantePago[0].filename}`);
            }
            throw error;
        }
    }

    @Post(':id/factura')
    @ApiOperation({
        summary: 'Subir factura',
        description: `Sube la factura para una solicitud específica.

**Archivos soportados:**
- Imágenes: JPEG, PNG, GIF, WebP
- Documentos: PDF
- Tamaño máximo: 5MB

**Notas importantes:**
- Si ya existe una factura, será reemplazada
- Solo el propietario de la solicitud o un admin pueden subir archivos
- El archivo se guardará en /uploads/facturas/

**Ejemplo usando curl:**
\`\`\`bash
curl -X POST "http://localhost:3000/api/solicitudes/1/factura" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "factura=@/path/to/factura.pdf"
\`\`\``,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                factura: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo de la factura',
                },
            },
            required: ['factura'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Factura subida exitosamente',
        schema: {
            example: {
                factura: 'factura_def456.pdf',
                message: 'Factura subida correctamente',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Archivo inválido o no proporcionado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'factura', maxCount: 1 }], facturasMulterConfig)
    )
    async uploadFactura(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: { factura?: Express.Multer.File[] },
        @GetUser() user: Usuario
    ) {
        try {
            console.log('Files received for factura:', files);
            console.log('Files type:', typeof files);
            console.log('Factura files:', files?.factura);

            if (!files || !files.factura || !files.factura[0]) {
                throw new Error('No se recibió el archivo factura');
            }

            const result = await this.solicitudesService.uploadFactura(
                id,
                files.factura[0],
                user.id
            );
            return result;
        } catch (error) {
            if (files?.factura?.[0]) {
                this.fileService.deleteFile(`facturas/${files.factura[0].filename}`);
            }
            throw error;
        }
    }

    @Get(':id/comprobante/download')
    @ApiOperation({
        summary: 'Descargar comprobante de pago',
        description: `Descarga el comprobante de pago de una solicitud específica.

**Notas importantes:**
- Solo el propietario de la solicitud o un admin pueden descargar el archivo
- El archivo se descarga directamente con su nombre original
- Si no existe comprobante, retorna error 404

**Ejemplo usando curl:**
\`\`\`bash
curl -X GET "http://localhost:3000/api/solicitudes/1/comprobante/download" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o comprobante.jpg
\`\`\``,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Comprobante descargado exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud o comprobante no encontrado' })
    async downloadComprobante(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: Usuario,
        @Res() res: Response
    ) {
        return this.solicitudesService.downloadComprobante(id, user.id, res);
    }

    @Get(':id/comprobante/view')
    @ApiOperation({
        summary: 'Ver comprobante de pago',
        description:
            'Muestra el comprobante de pago directamente en el navegador (para imágenes y PDFs)',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Comprobante mostrado exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Solicitud o comprobante no encontrado' })
    async viewComprobante(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: Usuario,
        @Res() res: Response
    ) {
        return this.solicitudesService.viewComprobante(id, user.id, res);
    }

    @Get(':id/factura/download')
    @ApiOperation({
        summary: 'Descargar factura',
        description: `Descarga la factura de una solicitud específica.

**Notas importantes:**
- Solo el propietario de la solicitud o un admin pueden descargar el archivo
- El archivo se descarga directamente con su nombre original
- Si no existe factura, retorna error 404

**Ejemplo usando curl:**
\`\`\`bash
curl -X GET "http://localhost:3000/api/solicitudes/1/factura/download" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o factura.pdf
\`\`\``,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Factura descargada exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud o factura no encontrada' })
    async downloadFactura(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: Usuario,
        @Res() res: Response
    ) {
        return this.solicitudesService.downloadFactura(id, user.id, res);
    }

    @Get(':id/factura/view')
    @ApiOperation({
        summary: 'Ver factura',
        description: 'Muestra la factura directamente en el navegador (para imágenes y PDFs)',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Factura mostrada exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Solicitud o factura no encontrada' })
    async viewFactura(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: Usuario,
        @Res() res: Response
    ) {
        return this.solicitudesService.viewFactura(id, user.id, res);
    }

    @Get('estadisticas')
    @ApiOperation({
        summary: 'Obtener estadísticas de solicitudes',
        description:
            'Retorna estadísticas resumidas de todas las solicitudes o del usuario autenticado',
    })
    async getStats(@GetUser() user: Usuario) {
        // Si es cliente, solo ver sus estadísticas. Si es admin, ver todas
        const isAdmin = user.rol.nombre === Roles.ADMIN;
        return this.solicitudesService.getStats(isAdmin ? undefined : user.id);
    }

    @Get()
    @ApiOperation({
        summary: 'Obtener todas las solicitudes con filtros y paginación',
        description: 'Retorna solicitudes con filtros opcionales, paginación y ordenamiento',
    })
    findAll(@Query() query: QuerySolicitudDto) {
        return this.solicitudesService.findAll(query);
    }

    @Get('hoy/actuales')
    @ApiOperation({
        summary: 'Obtener solicitudes de hoy',
        description: 'Retorna todas las solicitudes creadas hoy con paginación',
    })
    @ApiResponse({
        status: 200,
        description: 'Solicitudes de hoy obtenidas exitosamente',
        schema: {
            example: {
                data: [],
                total: 0,
                page: 1,
                pageCount: 0,
                fechaFiltro: {
                    desde: '2025-09-11T00:00:00.000Z',
                    hasta: '2025-09-11T23:59:59.999Z',
                    descripcion: 'Solicitudes de hoy',
                },
            },
        },
    })
    findSolicitudesHoy(@Query() query: QuerySolicitudDto) {
        return this.solicitudesService.findSolicitudesHoy(query);
    }

    @Get('pasadas/dia-anterior')
    @ApiOperation({
        summary: 'Obtener solicitudes del día anterior',
        description: 'Retorna todas las solicitudes creadas el día anterior con paginación',
    })
    @ApiResponse({
        status: 200,
        description: 'Solicitudes del día anterior obtenidas exitosamente',
        schema: {
            example: {
                data: [],
                total: 0,
                page: 1,
                pageCount: 0,
                fechaFiltro: {
                    desde: '2024-01-01T00:00:00.000Z',
                    hasta: '2024-01-01T23:59:59.999Z',
                    descripcion: 'Solicitudes del día anterior',
                },
            },
        },
    })
    findSolicitudesPasadas(@Query() query: QuerySolicitudDto) {
        return this.solicitudesService.findSolicitudesPasadas(query);
    }

    @Get('historial/todas')
    @ApiOperation({
        summary: 'Obtener historial de solicitudes',
        description:
            'Retorna todas las solicitudes anteriores a hoy (historial completo) con paginación',
    })
    @ApiResponse({
        status: 200,
        description: 'Historial de solicitudes obtenido exitosamente',
        schema: {
            example: {
                data: [],
                total: 0,
                page: 1,
                pageCount: 0,
                fechaFiltro: {
                    hasta: '2025-09-11T00:00:00.000Z',
                    descripcion: 'Historial de solicitudes (anteriores a hoy)',
                },
            },
        },
    })
    findHistorialSolicitudes(@Query() query: QuerySolicitudDto) {
        return this.solicitudesService.findHistorialSolicitudes(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una solicitud por ID' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.solicitudesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar completamente una solicitud' })
    updatePut(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateSolicitudeDto: UpdateSolicitudDto,
        @GetUser() user: Usuario
    ) {
        return this.solicitudesService.update(id, updateSolicitudeDto, user.id);
    }

    @Patch(':id/estado')
    @ApiOperation({
        summary: 'Cambiar estado de una solicitud',
        description: `Permite cambiar el estado de una solicitud siguiendo el flujo de negocio:
        
**Flujo de estados:**
- PENDIENTE → SUBIDO (cliente sube comprobante)
- SUBIDO → VERIFICADA (admin verifica pago)
- VERIFICADA → PAGADA (admin sube factura)
- Cualquier estado → ANULADA (solo admin)

**Validaciones:**
- Clientes solo pueden cambiar de PENDIENTE a SUBIDO
- Admins pueden hacer cualquier transición válida`,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Estado cambiado exitosamente' })
    @ApiResponse({ status: 400, description: 'Transición de estado inválida' })
    @ApiResponse({ status: 403, description: 'Sin permisos para cambiar el estado' })
    async changeState(
        @Param('id', ParseIntPipe) id: number,
        @Body() changeStateDto: ChangeStateDto,
        @GetUser() user: Usuario
    ) {
        return this.solicitudesService.changeState(id, changeStateDto.estado, user.id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una solicitud' })
    remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: Usuario) {
        return this.solicitudesService.remove(id, user.id);
    }

    @Delete(':id/files/:fileType')
    @ApiOperation({
        summary: 'Eliminar un archivo específico de una solicitud',
        description: `Elimina un archivo específico (comprobante o factura) de una solicitud.

**Tipos de archivo:**
- \`comprobantePago\`: Elimina el comprobante de pago
- \`factura\`: Elimina la factura

**Ejemplo:**
- DELETE /solicitudes/1/files/comprobantePago
- DELETE /solicitudes/1/files/factura`,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiParam({
        name: 'fileType',
        description: 'Tipo de archivo a eliminar',
        enum: ['comprobantePago', 'factura'],
    })
    @ApiResponse({
        status: 200,
        description: 'Archivo eliminado exitosamente',
        schema: {
            example: {
                message: 'Comprobante de pago eliminado correctamente',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud o archivo no encontrado' })
    async deleteFile(
        @Param('id', ParseIntPipe) id: number,
        @Param('fileType') fileType: 'comprobantePago' | 'factura',
        @GetUser() user: Usuario
    ) {
        return this.solicitudesService.deleteFile(id, fileType, user.id);
    }

    @Post(':id/dress')
    @ApiOperation({
        summary: 'Subir archivo DRESS',
        description: `Sube el archivo DRESS para una solicitud específica.\n\n**Archivos soportados:**\n- Imágenes: JPEG, PNG, GIF, WebP\n- Documentos: PDF\n- Tamaño máximo: 5MB\n\n**Notas importantes:**\n- Si ya existe un archivo DRESS, será reemplazado\n- Solo el propietario de la solicitud o un admin pueden subir archivos\n- El archivo se guardará en /uploads/dress/`,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                dress: {
                    type: 'string',
                    format: 'binary',
                    description: 'Archivo DRESS',
                },
            },
            required: ['dress'],
        },
    })
    @ApiResponse({
        status: 200,
        description: 'Archivo DRESS subido exitosamente',
        schema: {
            example: {
                dress: 'dress_abc123.jpg',
                message: 'Archivo DRESS subido correctamente',
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Archivo inválido o no proporcionado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'dress', maxCount: 1 }], dressMulterConfig))
    async uploadDress(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFiles() files: { dress?: Express.Multer.File[] },
        @GetUser() user: Usuario
    ) {
        try {
            if (!files || !files.dress || !files.dress[0]) {
                throw new Error('No se recibió el archivo DRESS');
            }
            const result = await this.solicitudesService.uploadDress(id, files.dress[0], user.id);
            return result;
        } catch (error) {
            if (files?.dress?.[0]) {
                this.fileService.deleteFile(`dress/${files.dress[0].filename}`);
            }
            throw error;
        }
    }

    @Get(':id/dress/download')
    @ApiOperation({
        summary: 'Descargar archivo DRESS',
        description: `Descarga el archivo DRESS de una solicitud específica.\n\n**Notas importantes:**\n- Solo el propietario de la solicitud o un admin pueden descargar el archivo\n- El archivo se descarga directamente con su nombre original\n- Si no existe DRESS, retorna error 404`,
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Archivo DRESS descargado exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Sin permisos para esta solicitud' })
    @ApiResponse({ status: 404, description: 'Solicitud o archivo DRESS no encontrado' })
    async downloadDress(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: Usuario,
        @Res() res: Response
    ) {
        return this.solicitudesService.downloadDress(id, user.id, res);
    }

    @Get(':id/dress/view')
    @ApiOperation({
        summary: 'Ver archivo DRESS',
        description: 'Muestra el archivo DRESS directamente en el navegador (para imágenes y PDFs)',
    })
    @ApiParam({ name: 'id', description: 'ID de la solicitud', type: 'number' })
    @ApiResponse({ status: 200, description: 'Archivo DRESS mostrado exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Solicitud o archivo DRESS no encontrado' })
    async viewDress(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: Usuario,
        @Res() res: Response
    ) {
        return this.solicitudesService.viewDress(id, user.id, res);
    }
}
