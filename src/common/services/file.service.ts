import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

/**
 * Servicio para manejar operaciones con archivos
 */
@Injectable()
export class FileService {
  private readonly uploadPath = './uploads';

  /**
   * Valida que el archivo subido sea válido
   * @param file - Archivo a validar
   * @returns string - Nombre del archivo
   */
  validateFile(file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      this.deleteFile(file.filename);
      throw new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WebP) y PDFs.'
      );
    }

    return file.filename;
  }

  /**
   * Elimina un archivo del sistema de archivos
   * @param filename - Nombre del archivo a eliminar (puede incluir subcarpeta)
   */
  deleteFile(filename: string): void {
    if (!filename) return;

    // Si el filename incluye una subcarpeta, úsala, sino usa la carpeta principal
    const filePath = filename.includes('/') 
      ? join(this.uploadPath, filename)
      : join(this.uploadPath, filename);
    
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
    }
  }

  /**
   * Verifica si un archivo existe
   * @param filename - Nombre del archivo
   * @returns boolean
   */
  fileExists(filename: string): boolean {
    if (!filename) return false;
    
    const filePath = join(this.uploadPath, filename);
    return existsSync(filePath);
  }

  /**
   * Obtiene la ruta completa de un archivo
   * @param filename - Nombre del archivo
   * @returns string
   */
  getFilePath(filename: string): string {
    return join(this.uploadPath, filename);
  }

  /**
   * Valida múltiples archivos
   * @param files - Array de archivos
   * @returns string[] - Array de nombres de archivos válidos
   */
  validateFiles(files: Express.Multer.File[]): string[] {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    return files.map(file => this.validateFile(file));
  }

  /**
   * Elimina múltiples archivos
   * @param filenames - Array de nombres de archivos
   */
  deleteFiles(filenames: string[]): void {
    if (!filenames || filenames.length === 0) return;

    filenames.forEach(filename => {
      if (filename) {
        this.deleteFile(filename);
      }
    });
  }
}
