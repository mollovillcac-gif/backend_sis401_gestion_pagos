-- Ejecuta para limpiar la base de datos.

-- Deshabilitar restricciones de claves foráneas temporalmente
SET session_replication_role = 'replica';

DROP TABLE IF EXISTS solicitudes CASCADE;
DROP TABLE IF EXISTS tarifas CASCADE;
DROP TABLE IF EXISTS configuraciones CASCADE;
DROP TABLE IF EXISTS navieras CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Restaurar las restricciones de claves foráneas
SET session_replication_role = 'origin';
