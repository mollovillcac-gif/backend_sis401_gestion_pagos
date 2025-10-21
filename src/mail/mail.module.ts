import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
    imports: [
        ConfigModule, // asegúrate de tener ConfigModule.forRoot({ isGlobal: true }) en AppModule
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                const port = Number(config.get<string>('MAIL_PORT'));
                const secure = String(config.get<string>('MAIL_SECURE')).toLowerCase() === 'true';
                return {
                    transport: {
                        host: config.get<string>('MAIL_HOST'), // smtp.gmail.com
                        port, // 465 o 587
                        secure, // 465->true, 587->false
                        auth: {
                            user: config.get<string>('MAIL_USER'),
                            pass: config.get<string>('MAIL_PASSWORD'),
                        },
                        // 👇 ayuda en Render/otras nubes
                        family: 4, // fuerza IPv4
                        connectionTimeout: 15000,
                        greetingTimeout: 10000,
                        socketTimeout: 20000,
                        // tls: { rejectUnauthorized: false }, // déjalo comentado; solo si el log lo pide
                    },
                    defaults: {
                        from: config.get<string>('MAIL_FROM'), // "Cargas Pafunncio" <correo@gmail.com>
                    },
                    template: {
                        // Usa la carpeta compilada en dist/mail/templates
                        dir: join(__dirname, 'templates'),
                        adapter: new HandlebarsAdapter(),
                        options: { strict: true },
                    },
                };
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule {}
