import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { TarifasModule } from './tarifas/tarifas.module';
import { ConfiguracionesModule } from './configuraciones/configuraciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { NavierasModule } from './navieras/navieras.module';
import { FilesController } from './common/controllers/files.controller';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres', // type es para la base de datos que se va a utilizar postgres
      host: process.env.DB_HOST, // host es la dirección del servidor de la base de datos
      port: Number(process.env.DB_PORT), // port es el puerto en el que se está ejecutando la base de datos
      username: process.env.DB_USERNAME, // username es el usuario de la base de datos
      password: process.env.DB_PASSWORD, // password es la contraseña del usuario de la base de datos
      database: process.env.DB_NAME, // database es el nombre de la base de datos
      entities: [__dirname + '*/**/entities/*.(ts|js)'], // entities es la ruta donde se encuentran las entidades de TypeORM
      synchronize: true, // synchronize es para sincronizar las entidades con la base de datos
      autoLoadEntities: true, // autoLoadEntities es para cargar automáticamente las entidades
      ssl: {
        rejectUnauthorized: false,
      },
      extra: {
        timezone: 'America/La_Paz'
      }
    }),
    DashboardModule,
    SolicitudesModule,
    TarifasModule,
    ConfiguracionesModule,
    UsuariosModule,
    RolesModule,
    AuthModule,
    MailModule,
    NavierasModule,
  ],
  controllers: [FilesController],
  providers: [],
})
export class AppModule {}
