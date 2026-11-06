-- =====================================================================
-- ART INK TATTOO STUDIO — SCRIPT INICIAL UNIFICADO DE BASE DE DATOS
-- Versión: 2.1 (Consolidada con soporte completo para los 33 Casos de Prueba)
-- Motor: MySQL 8.0+ | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =====================================================================

CREATE DATABASE IF NOT EXISTS tatuaje 
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE tatuaje;

-- ---------------------------------------------------------------------
-- 0. LIMPIEZA INICIAL DE TABLAS (Orden seguro de llaves foráneas)
-- ---------------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS FACTURA;
DROP TABLE IF EXISTS SESION;
DROP TABLE IF EXISTS TATUAJE;
DROP TABLE IF EXISTS TARIFA;
DROP TABLE IF EXISTS USUARIO;
DROP TABLE IF EXISTS CLIENTE;
-- Tablas obsoletas o legacy
DROP TABLE IF EXISTS DETALLE_FACTURA;
DROP TABLE IF EXISTS PAGO;
DROP TABLE IF EXISTS SESION_USUARIO;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. TABLA: CLIENTE (HU-01, HU-08)
-- =====================================================================
CREATE TABLE CLIENTE (
    id_cliente INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT CLIENTE_PK PRIMARY KEY (id_cliente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 2. TABLA: USUARIO (HU-10, HU-11)
-- =====================================================================
CREATE TABLE USUARIO (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    identificacion VARCHAR(30) NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'ADMINISTRADOR', 'TATUADOR'
    estado VARCHAR(15) NOT NULL DEFAULT 'ACTIVO', -- 'ACTIVO', 'INACTIVO'
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT USUARIO_PK PRIMARY KEY (id_usuario),
    CONSTRAINT USUARIO__CORREO_UK UNIQUE (correo),
    CONSTRAINT USUARIO_ESTADO_CHK CHECK (estado IN ('ACTIVO', 'INACTIVO'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 3. TABLA: TARIFA (HU-04: CP-10, CP-11, CP-12)
-- =====================================================================
CREATE TABLE TARIFA (
    id_tarifa INT NOT NULL AUTO_INCREMENT,
    tipo_trabajo VARCHAR(60) NOT NULL,
    valor_hora DECIMAL(12,2) NOT NULL,
    tatuador_nombre VARCHAR(100) NULL,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT TARIFA_PK PRIMARY KEY (id_tarifa),
    CONSTRAINT TARIFA_TIPO_UK UNIQUE (tipo_trabajo),
    CONSTRAINT TARIFA_VALOR_HORA_CHK CHECK (valor_hora > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 4. TABLA: TATUAJE (HU-03, HU-07)
-- =====================================================================
CREATE TABLE TATUAJE (
    id_tatuaje INT NOT NULL AUTO_INCREMENT,
    diseno VARCHAR(200) NOT NULL,
    zona_cuerpo VARCHAR(60) NOT NULL,
    estado VARCHAR(15) NOT NULL DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'
    horas_estimadas DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    valor_estimado DECIMAL(12,2) NOT NULL,
    fecha_finalizacion DATE NULL,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT TATUAJE_PK PRIMARY KEY (id_tatuaje),
    CONSTRAINT TATUAJE_ESTADO_CHK CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT TATUAJE_VALOR_EST_CHK CHECK (valor_estimado >= 0),
    CONSTRAINT TATUAJE_HORAS_EST_CHK CHECK (horas_estimadas > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 5. TABLA: SESION (HU-02, HU-03, HU-05, HU-07)
-- =====================================================================
CREATE TABLE SESION (
    id_sesion INT NOT NULL AUTO_INCREMENT,
    tatuaje_id INT NOT NULL,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    tarifa_id INT NULL,
    fecha DATE NOT NULL,
    duracion_horas DECIMAL(4,2) NOT NULL,
    es_retoque VARCHAR(1) NOT NULL DEFAULT 'N',
    valor DECIMAL(12,2) NOT NULL,
    anticipo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT SESION_PK PRIMARY KEY (id_sesion),
    CONSTRAINT SESION_TATUAJE_FK FOREIGN KEY (tatuaje_id) REFERENCES TATUAJE (id_tatuaje),
    CONSTRAINT SESION_CLIENTE_FK FOREIGN KEY (cliente_id) REFERENCES CLIENTE (id_cliente),
    CONSTRAINT SESION_USUARIO_FK FOREIGN KEY (usuario_id) REFERENCES USUARIO (id_usuario),
    CONSTRAINT SESION_TARIFA_FK FOREIGN KEY (tarifa_id) REFERENCES TARIFA (id_tarifa),
    CONSTRAINT SESION_RETOQUE_CHK CHECK (es_retoque IN ('S', 'N')),
    CONSTRAINT SESION_VALOR_CHK CHECK (valor >= 0),
    CONSTRAINT SESION_ANTICIPO_CHK CHECK (anticipo >= 0),
    CONSTRAINT SESION_ANTICIPO_VAL_CHK CHECK (anticipo <= valor),
    CONSTRAINT SESION_DURACION_CHK CHECK (duracion_horas > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 6. TABLA: FACTURA (HU-06, HU-08, HU-09)
-- Soporta tanto liquidación de sesión individual como factura de tatuaje multi-sesión
-- =====================================================================
CREATE TABLE FACTURA (
    id_factura INT NOT NULL AUTO_INCREMENT,
    sesion_id INT NULL,
    tatuaje_id INT NULL,
    fecha_emision DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'expedida', -- 'expedida', 'pago', 'eliminada'
    horas_facturadas DECIMAL(4,2) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    tipo_pago VARCHAR(20) NULL, -- 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA'
    fecha_pago DATETIME NULL,
    monto_pagado DECIMAL(12,2) NULL DEFAULT 0.00,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT FACTURA_PK PRIMARY KEY (id_factura),
    CONSTRAINT FACTURA_SESION_FK FOREIGN KEY (sesion_id) REFERENCES SESION (id_sesion),
    CONSTRAINT FACTURA_TATUAJE_FK FOREIGN KEY (tatuaje_id) REFERENCES TATUAJE (id_tatuaje),
    CONSTRAINT FACTURA_ESTADO_CHK CHECK (estado IN ('expedida', 'pago', 'eliminada')),
    CONSTRAINT FACTURA_TIPO_PAGO_CHK CHECK (tipo_pago IS NULL OR tipo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA')),
    CONSTRAINT FACTURA_TOTAL_CHK CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- 7. DATOS SEMILLA INICIALES (Seed Data para pruebas y primer uso)
-- =====================================================================

-- Usuarios Administrativo y Tatuador con hash Bcrypt (10 salt rounds)
-- admin@estudio.com / admin123
-- carlos@estudio.com / tatuador123
INSERT INTO USUARIO (id_usuario, identificacion, nombre, correo, clave, rol, estado, usuario_creacion)
VALUES 
    (1, '1000000001', 'Administrador General', 'admin@estudio.com', '$2b$10$GLRJORiwSciX9FdmJhozLeYrJ2Ge/DWtkW3eRbVwye9WFurS3pno.', 'ADMINISTRADOR', 'ACTIVO', 'SEMILLA'),
    (2, '1000000002', 'Carlos Ruiz', 'carlos@estudio.com', '$2b$10$Lt4djpvCje9rHLcmCxps6ei23yvvgcRtqkPd4.NcD.YbUet0bAddi', 'TATUADOR', 'ACTIVO', 'SEMILLA');

-- Tarifas estándar de catálogo (HU-04)
INSERT INTO TARIFA (id_tarifa, tipo_trabajo, valor_hora, tatuador_nombre, usuario_creacion)
VALUES 
    (1, 'Blackwork', 150000.00, 'Carlos Ruiz', 'SEMILLA'),
    (2, 'Línea fina', 120000.00, 'Carlos Ruiz', 'SEMILLA'),
    (3, 'Realismo Sombras', 220000.00, 'Carlos Ruiz', 'SEMILLA'),
    (4, 'Tradicional / Old School', 140000.00, 'Carlos Ruiz', 'SEMILLA'),
    (5, 'Minimalista', 90000.00, 'Carlos Ruiz', 'SEMILLA'),
    (6, 'Geométrico / Puntillismo', 160000.00, 'Carlos Ruiz', 'SEMILLA');

-- Clientes iniciales de ejemplo (HU-01)
INSERT INTO CLIENTE (id_cliente, nombre, telefono, correo, usuario_creacion)
VALUES 
    (1, 'Laura Gómez', '3104567890', 'laura.gomez@mail.com', 'SEMILLA'),
    (2, 'Andrés Mejía', '3159876543', 'andres.mejia@mail.com', 'SEMILLA'),
    (3, 'Camila Restrepo', '3201234567', 'camila.restrepo@mail.com', 'SEMILLA');

-- =====================================================================
-- FIN DEL SCRIPT UNIFICADO
-- =====================================================================
