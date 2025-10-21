-- Ejecútalo en tu base de datos para crear la estructura inicial. 

-- Crear tabla roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre character varying(50) NOT NULL,
    descripcion character varying(250),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz') NOT NULL,
    fecha_modificacion timestamp with time zone NULL,
    fecha_eliminacion timestamp with time zone NULL
);

-- Crear tabla usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    usuario character varying(20) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    correo character varying(255),
    telefono character varying(20),
    clave character varying(255) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    ultimo_login timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz'),
    rol_id integer NOT NULL REFERENCES roles(id),
    fecha_creacion timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz') NOT NULL,
    fecha_modificacion timestamp with time zone NULL,
    fecha_eliminacion timestamp with time zone NULL
);

-- Crear tabla navieras
CREATE TABLE navieras (
    id SERIAL PRIMARY KEY,
    nombre character varying(100) NOT NULL,
    descripcion character varying(250),
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz') NOT NULL,
    fecha_modificacion timestamp with time zone NULL,
    fecha_eliminacion timestamp with time zone NULL
);

-- Crear tabla tarifas
CREATE TABLE tarifas (
    id SERIAL PRIMARY KEY,
    naviera_id integer NOT NULL REFERENCES navieras(id),
    monto_base decimal(10,2) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz') NOT NULL,
    fecha_modificacion timestamp with time zone NULL,
    fecha_eliminacion timestamp with time zone NULL
);

-- Crear tabla configuraciones
CREATE TABLE configuraciones (
    id SERIAL PRIMARY KEY,
    comision_porcentaje decimal(5,2) DEFAULT 3.0 NOT NULL,
    tipo_cambio_usd decimal(10,2) DEFAULT 6.96 NOT NULL,
    tipo_cambio_clp decimal(10,4) DEFAULT 0.008 NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz') NOT NULL,
    fecha_modificacion timestamp with time zone NULL,
    fecha_eliminacion timestamp with time zone NULL
);

-- Crear tabla solicitudes
CREATE TABLE solicitudes (
    id SERIAL PRIMARY KEY,
    usuario_id integer NOT NULL REFERENCES usuarios(id),
    bl character varying(100) NOT NULL,
    contenedor character varying(100) NOT NULL,
    naviera_id integer NOT NULL REFERENCES navieras(id),
    documento character varying(20) NOT NULL,
    tipo_documento character varying(20),
    tipo character varying(20) DEFAULT 'gatein' NOT NULL CHECK (tipo IN ('gatein', 'demora', 'liberacion', 'giros')),
    total_final_bs decimal(10,2) NOT NULL,
    monto_base decimal(10,2),
    comision_porcentaje decimal(5,2),
    comision_monto decimal(10,2),
    tipo_cambio_usado decimal(10,4),
    detalle_calculo text,
    estado character varying(20) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('subido', 'anulada', 'pendiente', 'verificada')),
    comprobante_pago character varying(255),
    factura character varying(255),
    fecha_creacion timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/La_Paz') NOT NULL,
    fecha_modificacion timestamp with time zone NULL,
    fecha_eliminacion timestamp with time zone NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_tarifas_naviera_id ON tarifas(naviera_id);
CREATE INDEX idx_solicitudes_usuario_id ON solicitudes(usuario_id);
CREATE INDEX idx_solicitudes_naviera_id ON solicitudes(naviera_id);
CREATE INDEX idx_solicitudes_documento ON solicitudes(documento);
CREATE INDEX idx_solicitudes_tipo ON solicitudes(tipo);
CREATE INDEX idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX idx_solicitudes_fecha_creacion ON solicitudes(fecha_creacion);
