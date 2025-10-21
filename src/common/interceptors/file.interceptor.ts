import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class FileInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const baseUrl = `${request.protocol}://${request.get('host')}`;

        return next.handle().pipe(
            map((data) => {
                if (data && typeof data === 'object') {
                    return this.transformData(data, baseUrl);
                }
                return data;
            })
        );
    }

    private transformData(obj: any, baseUrl: string): any {
        if (Array.isArray(obj)) {
            return obj.map((item) => this.transformData(item, baseUrl));
        }

        if (obj && typeof obj === 'object') {
            const transformed = { ...obj };

            // Transformar campos específicos de archivos
            if (transformed.comprobantePago && !transformed.comprobantePago.startsWith('http')) {
                transformed.comprobantePago = `${baseUrl}/uploads/comprobantes/${transformed.comprobantePago}`;
            }

            if (transformed.factura && !transformed.factura.startsWith('http')) {
                transformed.factura = `${baseUrl}/uploads/facturas/${transformed.factura}`;
            }

            // Transformar fechas
            // Transformar fechas
            this.transformDates(transformed);

            // Recursivamente transformar objetos anidados
            for (const key in transformed) {
                if (
                    transformed[key] &&
                    typeof transformed[key] === 'object' &&
                    !(transformed[key] instanceof Date)
                ) {
                    transformed[key] = this.transformData(transformed[key], baseUrl);
                }
            }

            return transformed;
        }

        return obj;
    }

    private transformDates(obj: any): void {
        // Manejar campos de fecha específicos
        const dateFields = ['fechaCreacion', 'fechaModificacion', 'ultimoLogin'];

        for (const field of dateFields) {
            if (obj[field]) {
                if (obj[field] instanceof Date) {
                    obj[field] = obj[field].toISOString();
                } else if (typeof obj[field] === 'string') {
                    // Si ya es string, asegurar que sea una fecha válida
                    const date = new Date(obj[field]);
                    obj[field] = isNaN(date.getTime()) ? null : date.toISOString();
                } else if (typeof obj[field] === 'object' && Object.keys(obj[field]).length === 0) {
                    // Si es un objeto vacío, establecer como null
                    obj[field] = null;
                }
            }
        }
    }
}
