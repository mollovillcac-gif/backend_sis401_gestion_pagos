import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // elimina campos no definidos
        })
    );

    app.setGlobalPrefix('api');

    //Configuración para versión de la API
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

    // Configuración de CORS
    app.enableCors({
        origin: ['https://frontend-sis401-gestion-pagos.onrender.com'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    });

    // todo esto que pondre es del swagger
    const config = new DocumentBuilder()
        .setTitle('API Rest de Solicitudes de Gatein y Demora')
        .setDescription('API Rest de solicitudes para mi monografía de grado')
        .setVersion('1.0')
        .addTag('Auth')
        .addTag('Usuarios')
        .addTag('Roles')
        .addTag('Navieras')
        .addTag('Tarifas')
        .addTag('Configuraciones')
        .addTag('Solicitudes')
        .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' })
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('apidoc', app, documentFactory);

    await app.listen(process.env.PORT ?? 3000);
    console.log(`App corriendo en ${await app.getUrl()}/apidoc`);
}

void bootstrap();
