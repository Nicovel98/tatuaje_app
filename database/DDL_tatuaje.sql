-- =====================================================================
-- Base de Datos Corregida y Alineada con las HU (Art Ink - 3FN)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS tatuaje;
USE tatuaje;

-- =====================================================================
-- 1. TABLAS INDEPENDIENTES (Catálogos Base)
-- =====================================================================

CREATE TABLE CLIENTE (
    id_cliente INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(120) NOT NULL, -- (HU-01) Correo de contacto del cliente
    CONSTRAINT CLIENTE_PK PRIMARY KEY (id_cliente)
);

CREATE TABLE TARIFA (
    id_tarifa INT NOT NULL,
    tipo_trabajo VARCHAR(60) NOT NULL,
    valor_hora DECIMAL(10,2) NOT NULL,
    CONSTRAINT TARIFA_PK PRIMARY KEY (id_tarifa),
    CONSTRAINT TARIFA__TIPO_UK UNIQUE (tipo_trabajo),
    CONSTRAINT TARIFA_VALOR_HORA_CHK CHECK (valor_hora > 0)
);

CREATE TABLE USUARIO (
    id_usuario INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    clave VARCHAR(255) NOT NULL,
    rol VARCHAR(15) NOT NULL,
    estado VARCHAR(15) NOT NULL, -- (HU-11) Control de estado ('ACTIVO' / 'INACTIVO')
    CONSTRAINT USUARIO_PK PRIMARY KEY (id_usuario),
    CONSTRAINT USUARIO__CORREO_UK UNIQUE (correo),
    CONSTRAINT USUARIO_ESTADO_CHK CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

-- =====================================================================
-- 2. TABLAS DEPENDIENTES INTERMEDIAS
-- =====================================================================

CREATE TABLE TATUAJE (
    id_tatuaje INT NOT NULL,
    diseno VARCHAR(200) NOT NULL,
    zona_cuerpo VARCHAR(60) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    horas_estimadas DECIMAL(4,2) NOT NULL DEFAULT 1.00, -- Tiempo estimado del trabajo
    valor_estimado DECIMAL(12,2) NOT NULL,
    anticipo DECIMAL(12,2) NOT NULL DEFAULT 0.00, -- (HU-05) Abono inicial del agendamiento
    fecha_finalizacion DATE,
    CLIENTE_id_cliente INT NOT NULL,
    CONSTRAINT TATUAJE_PK PRIMARY KEY (id_tatuaje),
    CONSTRAINT TATUAJE_ESTADO_CHK CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT TATUAJE_VALOR_EST_CHK CHECK (valor_estimado >= 0),
    CONSTRAINT TATUAJE_ANTICIPO_CHK CHECK (anticipo >= 0),
    -- Regla de negocio HU-05: El anticipo nunca debe ser mayor al valor estimado del tatuaje
    CONSTRAINT TATUAJE_ANTICIPO_VAL_CHK CHECK (anticipo <= valor_estimado),
    CONSTRAINT TATUAJE_HORAS_EST_CHK CHECK (horas_estimadas > 0),
    CONSTRAINT TATUAJE_CLIENTE_FK FOREIGN KEY (CLIENTE_id_cliente) REFERENCES CLIENTE (id_cliente)
);

CREATE TABLE SESION (
    id_sesion INT NOT NULL,
    fecha DATE NOT NULL,
    duracion_horas DECIMAL(4,2) NOT NULL,
    es_retoque VARCHAR(1) NOT NULL, -- (HU-07) Indica si es ajuste / retoque ('S' o 'N')
    valor DECIMAL(12,2) NOT NULL,
    TATUAJE_id_tatuaje INT NOT NULL,
    USUARIO_id_usuario INT NOT NULL, -- Una sesión obligatoriamente requiere un tatuador asignado
    TARIFA_id_tarifa INT NOT NULL,
    CONSTRAINT SESION_PK PRIMARY KEY (id_sesion),
    CONSTRAINT SESION_RETOQUE_CHK CHECK (es_retoque IN ('S', 'N')),
    CONSTRAINT SESION_VALOR_CHK CHECK (valor >= 0),
    CONSTRAINT SESION_DURACION_CHK CHECK (duracion_horas > 0),
    CONSTRAINT SESION_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) REFERENCES TATUAJE (id_tatuaje),
    CONSTRAINT SESION_USUARIO_FK FOREIGN KEY (USUARIO_id_usuario) REFERENCES USUARIO (id_usuario),
    CONSTRAINT SESION_TARIFA_FK FOREIGN KEY (TARIFA_id_tarifa) REFERENCES TARIFA (id_tarifa)
);

-- =====================================================================
-- 3. SISTEMA DE FACTURACIÓN Y CONTROL DE PAGOS
-- =====================================================================

CREATE TABLE FACTURA (
    num_factura INT NOT NULL,
    fecha_emision DATE NOT NULL,
    total DECIMAL(12,2) NOT NULL, -- Neto total final a pagar liquidado
    TATUAJE_id_tatuaje INT NOT NULL, -- Relación directa: Se permite N facturas por tatuaje (elimina el UNIQUE)
    CONSTRAINT FACTURA_PK PRIMARY KEY (num_factura),
    CONSTRAINT FACTURA_TOTAL_CHK CHECK (total >= 0),
    CONSTRAINT FACTURA_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) REFERENCES TATUAJE (id_tatuaje)
);

CREATE TABLE DETALLE_FACTURA (
    id_detalle INT AUTO_INCREMENT NOT NULL,
    num_factura INT NOT NULL,
    id_sesion INT NOT NULL, -- Asocia de forma exacta qué sesión de horas se liquida en esta fila
    horas_facturadas DECIMAL(4,2) NOT NULL,
    valor_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    CONSTRAINT DETALLE_FACTURA_PK PRIMARY KEY (id_detalle),
    CONSTRAINT DETALLE_FACTURA_FAC_FK FOREIGN KEY (num_factura) REFERENCES FACTURA (num_factura) ON DELETE CASCADE,
    CONSTRAINT DETALLE_FACTURA_SES_FK FOREIGN KEY (id_sesion) REFERENCES SESION (id_sesion)
);

CREATE TABLE PAGO (
    id_pago INT NOT NULL,
    fecha DATE NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    tipo VARCHAR(15) NOT NULL, -- Forma de transacción
    num_factura INT NOT NULL, -- El pago extingue la deuda registrada en la Factura
    CONSTRAINT PAGO_PK PRIMARY KEY (id_pago),
    CONSTRAINT PAGO_VALOR_CHK CHECK (valor > 0),
    CONSTRAINT PAGO_TIPO_CHK CHECK (tipo IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA')),
    CONSTRAINT PAGO_FACTURA_FK FOREIGN KEY (num_factura) REFERENCES FACTURA (num_factura)
);