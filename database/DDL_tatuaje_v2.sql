-- =====================================================================
-- Base de Datos Reestructurada: Art Ink Tattoo Studio (v2)
-- Estandarización de PKs (id_[tabla]), FKs ([tabla]_id),
-- Auditoría Universal, Soft-Delete y Homólogo a Entity Framework
-- =====================================================================

CREATE DATABASE IF NOT EXISTS tatuaje;
USE tatuaje;

-- Desactivar temporalmente revisión de llaves foráneas para recreación limpia
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS FACTURA;
DROP TABLE IF EXISTS SESION;
DROP TABLE IF EXISTS TATUAJE;
DROP TABLE IF EXISTS USUARIO;
DROP TABLE IF EXISTS CLIENTE;
-- Eliminar tablas obsoletas si existen de versiones previas
DROP TABLE IF EXISTS DETALLE_FACTURA;
DROP TABLE IF EXISTS PAGO;
DROP TABLE IF EXISTS TARIFA;
DROP TABLE IF EXISTS SESION_USUARIO;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. TABLA CLIENTE
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
);

-- =====================================================================
-- 2. TABLA USUARIO
-- =====================================================================
CREATE TABLE USUARIO (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL, -- 'ADMINISTRADOR', 'TATUADOR'
    estado VARCHAR(15) NOT NULL DEFAULT 'ACTIVO',
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT USUARIO_PK PRIMARY KEY (id_usuario),
    CONSTRAINT USUARIO__CORREO_UK UNIQUE (correo),
    CONSTRAINT USUARIO_ESTADO_CHK CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

-- =====================================================================
-- 3. TABLA TATUAJE
-- =====================================================================
CREATE TABLE TATUAJE (
    id_tatuaje INT NOT NULL AUTO_INCREMENT,
    diseno VARCHAR(200) NOT NULL,
    zona_cuerpo VARCHAR(60) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    horas_estimadas DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    valor_estimado DECIMAL(12,2) NOT NULL,
    anticipo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    fecha_finalizacion DATE NULL,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT TATUAJE_PK PRIMARY KEY (id_tatuaje),
    CONSTRAINT TATUAJE_ESTADO_CHK CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT TATUAJE_VALOR_EST_CHK CHECK (valor_estimado >= 0),
    CONSTRAINT TATUAJE_ANTICIPO_CHK CHECK (anticipo >= 0),
    CONSTRAINT TATUAJE_ANTICIPO_VAL_CHK CHECK (anticipo <= valor_estimado),
    CONSTRAINT TATUAJE_HORAS_EST_CHK CHECK (horas_estimadas > 0)
);

-- =====================================================================
-- 4. TABLA SESION (Relación 1:1 con CLIENTE, 1:N con TATUAJE y 1:N con USUARIO)
-- =====================================================================
CREATE TABLE SESION (
    id_sesion INT NOT NULL AUTO_INCREMENT,
    tatuaje_id INT NOT NULL,
    cliente_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    duracion_horas DECIMAL(4,2) NOT NULL,
    es_retoque VARCHAR(1) NOT NULL DEFAULT 'N',
    valor DECIMAL(12,2) NOT NULL,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT SESION_PK PRIMARY KEY (id_sesion),
    CONSTRAINT SESION_TATUAJE_FK FOREIGN KEY (tatuaje_id) REFERENCES TATUAJE (id_tatuaje),
    CONSTRAINT SESION_CLIENTE_FK FOREIGN KEY (cliente_id) REFERENCES CLIENTE (id_cliente),
    CONSTRAINT SESION_USUARIO_FK FOREIGN KEY (usuario_id) REFERENCES USUARIO (id_usuario),
    -- Relación Uno a Uno Estricta con Cliente
    CONSTRAINT SESION_CLIENTE_UK UNIQUE (cliente_id),
    CONSTRAINT SESION_RETOQUE_CHK CHECK (es_retoque IN ('S', 'N')),
    CONSTRAINT SESION_VALOR_CHK CHECK (valor >= 0),
    CONSTRAINT SESION_DURACION_CHK CHECK (duracion_horas > 0)
);

-- =====================================================================
-- 5. TABLA FACTURA (Relación 1:N con SESION; Unifica Detalle y Pagos)
-- =====================================================================
CREATE TABLE FACTURA (
    id_factura INT NOT NULL AUTO_INCREMENT,
    sesion_id INT NOT NULL,
    fecha_emision DATE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'expedida',
    horas_facturadas DECIMAL(4,2) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    tipo_pago VARCHAR(20) NULL,
    fecha_pago DATETIME NULL,
    monto_pagado DECIMAL(12,2) NULL DEFAULT 0.00,
    eliminado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(100) NOT NULL DEFAULT 'SISTEMA',
    usuario_actualizacion VARCHAR(100) NULL,
    CONSTRAINT FACTURA_PK PRIMARY KEY (id_factura),
    CONSTRAINT FACTURA_SESION_FK FOREIGN KEY (sesion_id) REFERENCES SESION (id_sesion),
    CONSTRAINT FACTURA_ESTADO_CHK CHECK (estado IN ('expedida', 'pago', 'eliminada')),
    CONSTRAINT FACTURA_TIPO_PAGO_CHK CHECK (tipo_pago IS NULL OR tipo_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA')),
    CONSTRAINT FACTURA_TOTAL_CHK CHECK (total >= 0)
);
