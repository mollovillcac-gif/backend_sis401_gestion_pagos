-- Ejecútalo en tu base de datos para poblar las tablas con datos. 

-- Poblar la tabla roles
INSERT INTO roles ("nombre", "descripcion", "activo") VALUES
('administrador', 'Administrador del sistema con acceso completo', true),
('cliente', 'Usuario cliente que realiza solicitudes', true);

-- Poblar la tabla usuarios
-- Contraseña = password123 para todos los usuarios (hash: $2b$10$Be3OLWkLtOFxwoGpAzlNCez476S.ZBRH/wIkrJDih77fgABK9os5K)
INSERT INTO usuarios ("usuario", "nombre", "apellido", "correo", "telefono", "clave", "activo", "ultimo_login", "rol_id") VALUES
('admin', 'Administrador', 'Sistema', 'admin@gatein.com', '70000000', '$2b$10$Be3OLWkLtOFxwoGpAzlNCez476S.ZBRH/wIkrJDih77fgABK9os5K', true, NOW() AT TIME ZONE 'America/La_Paz', 1),
('jperez', 'Juan', 'Pérez', 'juan.perez@gatein.com', '70123456', '$2b$10$Be3OLWkLtOFxwoGpAzlNCez476S.ZBRH/wIkrJDih77fgABK9os5K', true, NOW() AT TIME ZONE 'America/La_Paz', 2),
('mlopez', 'María', 'López', 'maria.lopez@gatein.com', '70987654', '$2b$10$Be3OLWkLtOFxwoGpAzlNCez476S.ZBRH/wIkrJDih77fgABK9os5K', true, NOW() AT TIME ZONE 'America/La_Paz', 2),
('cmartinez', 'Carlos', 'Martínez', 'carlos.martinez@gatein.com', '70567123', '$2b$10$Be3OLWkLtOFxwoGpAzlNCez476S.ZBRH/wIkrJDih77fgABK9os5K', true, NOW() AT TIME ZONE 'America/La_Paz', 2),
('agomez', 'Ana', 'Gómez', 'ana.gomez@gatein.com', '70345678', '$2b$10$Be3OLWkLtOFxwoGpAzlNCez476S.ZBRH/wIkrJDih77fgABK9os5K', true, NOW() AT TIME ZONE 'America/La_Paz', 2);

-- Poblar la tabla navieras
INSERT INTO navieras ("nombre", "descripcion", "activo") VALUES
('CSAV', 'Compañía Sud Americana de Vapores', true),
('Hapag-Lloyd', 'Hapag-Lloyd AG - Línea naviera alemana', true),
('MSC', 'Mediterranean Shipping Company', true),
('Maersk Line', 'A.P. Moller-Maersk Group', true),
('CMA CGM', 'Compagnie Maritime d''Affrètement', true),
('COSCO', 'China Ocean Shipping Company', true),
('Evergreen', 'Evergreen Marine Corporation', true),
('APL', 'American President Lines', true),
('OOCL', 'Orient Overseas Container Line', true),
('NYK Line', 'Nippon Yusen Kabushiki Kaisha', true);

-- Poblar la tabla tarifas
INSERT INTO tarifas ("naviera_id", "monto_base", "activo") VALUES
(1, 150.00, true),  -- CSAV
(2, 175.00, true),  -- Hapag-Lloyd
(3, 160.00, true),  -- MSC
(4, 180.00, true),  -- Maersk Line
(5, 155.00, true),  -- CMA CGM
(6, 145.00, true),  -- COSCO
(7, 170.00, true),  -- Evergreen
(8, 165.00, true),  -- APL
(9, 158.00, true),  -- OOCL
(10, 162.00, true); -- NYK Line

-- Poblar la tabla configuraciones (configuración inicial del sistema)
INSERT INTO configuraciones ("comision_porcentaje", "tipo_cambio_usd", "tipo_cambio_clp") VALUES
(3.0, 6.96, 0.008);

-- Poblar la tabla solicitudes (datos de ejemplo)
INSERT INTO solicitudes ("usuario_id", "bl", "contenedor", "naviera_id", "documento", "tipo_documento", "tipo", "total_final_bs", "monto_base", "comision_porcentaje", "comision_monto", "tipo_cambio_usado", "estado") VALUES
(2, 'CSAV202401001', 'CONT001', 1, '87654321', 'CI', 'gatein', 1074.48, 150.00, 3.0, 4.50, 6.96, 'pendiente'),
(3, 'HAPL202401002', 'CONT002', 2, '11223344', 'CI', 'demora', 1258.52, 175.00, 3.0, 5.25, 6.96, 'verificada'),
(4, 'MSCU202401003', 'CONT003', 3, '44332211', 'CI', 'liberacion', 1143.36, 160.00, 3.0, 4.80, 6.96, 'pendiente'),
(5, 'MAEU202401004', 'CONT004', 4, '55667788', 'CI', 'gatein', 1289.28, 180.00, 3.0, 5.40, 6.96, 'subido'),
(2, 'CMDU202401005', 'CONT005', 5, '87654322', 'CI', 'giros', 1108.80, 155.00, 3.0, 4.65, 6.96, 'anulada'); 