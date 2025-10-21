import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateSerializationInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                return this.serializeDates(data);
            }),
        );
    }

    private serializeDates(obj: any): any {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (obj instanceof Date) {
            return obj.toISOString();
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.serializeDates(item));
        }

        if (typeof obj === 'object') {
            const serialized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    
                    // Manejar campos de fecha específicos
                    if ((key === 'fechaCreacion' || key === 'fechaModificacion' || key === 'ultimoLogin') && value) {
                        if (value instanceof Date) {
                            serialized[key] = value.toISOString();
                        } else if (typeof value === 'string') {
                            // Si ya es string, asegurar que sea una fecha válida
                            const date = new Date(value);
                            serialized[key] = isNaN(date.getTime()) ? null : date.toISOString();
                        } else {
                            // Si es un objeto vacío o algo extraño, establecer como null
                            serialized[key] = null;
                        }
                    } else {
                        serialized[key] = this.serializeDates(value);
                    }
                }
            }
            return serialized;
        }

        return obj;
    }
}
