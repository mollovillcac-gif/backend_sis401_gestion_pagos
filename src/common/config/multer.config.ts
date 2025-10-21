import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

/**
 * Configuración de Multer para el almacenamiento de archivos
 * Soporta múltiples tipos de archivos de imagen y documentos
 */
export const multerConfig = {
    storage: diskStorage({
        destination: './uploads', // Carpeta donde se guardarán los archivos por defecto
        filename: (req, file, cb) => {
            // Generar nombre único para el archivo
            const fileExtName = extname(file.originalname);
            const fileName = `${uuid()}${fileExtName}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        // Validar tipos de archivo permitidos
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y PDFs.'
                ),
                false
            );
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo por archivo
    },
};

/**
 * Configuración específica para comprobantes de pago
 */
export const comprobantesMulterConfig = {
    storage: diskStorage({
        destination: './uploads/comprobantes',
        filename: (req, file, cb) => {
            const fileExtName = extname(file.originalname);
            const fileName = `comprobante_${uuid()}${fileExtName}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Tipo de archivo no permitido para comprobante. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y PDFs.'
                ),
                false
            );
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
};

/**
 * Configuración específica para facturas
 */
export const facturasMulterConfig = {
    storage: diskStorage({
        destination: './uploads/facturas',
        filename: (req, file, cb) => {
            const fileExtName = extname(file.originalname);
            const fileName = `factura_${uuid()}${fileExtName}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Tipo de archivo no permitido para factura. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y PDFs.'
                ),
                false
            );
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
};

/**
 * Configuración específica para archivos DRESS
 */
export const dressMulterConfig = {
    storage: diskStorage({
        destination: './uploads/dress',
        filename: (req, file, cb) => {
            const fileExtName = extname(file.originalname);
            const fileName = `dress_${uuid()}${fileExtName}`;
            cb(null, fileName);
        },
    }),
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    'Tipo de archivo no permitido para DRESS. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y PDFs.'
                ),
                false
            );
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
};
