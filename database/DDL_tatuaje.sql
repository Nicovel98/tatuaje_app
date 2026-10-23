-- =====================================================================
-- Base de Datos Optimizada para Estudio de Tatuajes (Art Ink)
-- =====================================================================
CREATE DATABASE IF NOT EXISTS tatuaje;
USE tatuaje;

-- 1. TABLAS INDEPENDIENTES (Catálogos Base)
CREATE TABLE CLIENTE (
    id_cliente INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
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
    activo VARCHAR(1) NOT NULL,
    CONSTRAINT USUARIO_PK PRIMARY KEY (id_usuario),
    CONSTRAINT USUARIO__CORREO_UK UNIQUE (correo),
    CONSTRAINT USUARIO_ACTIVO_CHK CHECK (activo IN ('S', 'N'))
);

-- 2. TABLAS DEPENDIENTES INTERMEDIAS
CREATE TABLE TATUAJE (
    id_tatuaje INT NOT NULL,
    diseno VARCHAR(200) NOT NULL,
    zona_cuerpo VARCHAR(60) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    horas_estimadas DECIMAL(4,2) NOT NULL DEFAULT 1.00, -- 👈 Ajuste: Control de estimación de tiempo
    valor_estimado DECIMAL(12,2),
    fecha_finalizacion DATE,
    CLIENTE_id_cliente INT NOT NULL,
    CONSTRAINT TATUAJE_PK PRIMARY KEY (id_tatuaje),
    CONSTRAINT TATUAJE_ESTADO_CHK CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT TATUAJE_VALOR_EST_CHK CHECK (valor_estimado >= 0),
    CONSTRAINT TATUAJE_HORAS_EST_CHK CHECK (horas_estimadas > 0),
    CONSTRAINT TATUAJE_CLIENTE_FK FOREIGN KEY (CLIENTE_id_cliente) REFERENCES CLIENTE (id_cliente)
);

CREATE TABLE SESION (
    id_sesion INT NOT NULL,
    fecha DATE NOT NULL,
    duracion_horas DECIMAL(4,2) NOT NULL,
    es_retoque VARCHAR(1) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    TATUAJE_id_tatuaje INT NOT NULL,
    USUARIO_id_usuario INT NOT NULL, -- 👈 Obligatorio: Una sesión requiere un tatuador asignado
    TARIFA_id_tarifa INT NOT NULL,
    CONSTRAINT SESION_PK PRIMARY KEY (id_sesion),
    CONSTRAINT SESION_RETOQUE_CHK CHECK (es_retoque IN ('S', 'N')),
    CONSTRAINT SESION_VALOR_CHK CHECK (valor >= 0),
    CONSTRAINT SESION_DURACION_CHK CHECK (duracion_horas > 0),
    CONSTRAINT SESION_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) REFERENCES TATUAJE (id_tatuaje),
    CONSTRAINT SESION_USUARIO_FK FOREIGN KEY (USUARIO_id_usuario) REFERENCES USUARIO (id_usuario),
    CONSTRAINT SESION_TARIFA_FK FOREIGN KEY (TARIFA_id_tarifa) REFERENCES TARIFA (id_tarifa)
);

-- 3. SISTEMA DE FACTURACIÓN Y CONTROL DE PAGOS
CREATE TABLE FACTURA (
    num_factura INT NOT NULL,
    fecha_emision DATE NOT NULL,
    total DECIMAL(12,2) NOT NULL, -- Sumatoria neta calculada de los detalles
    TATUAJE_id_tatuaje INT NOT NULL, -- 👈 Corregido: Quitamos el UNIQUE para permitir múltiples facturas por abonos si es necesario
    CONSTRAINT FACTURA_PK PRIMARY KEY (num_factura),
    CONSTRAINT FACTURA_TOTAL_CHK CHECK (total >= 0),
    CONSTRAINT FACTURA_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) REFERENCES TATUAJE (id_tatuaje)
);

CREATE TABLE DETALLE_FACTURA (
    id_detalle INT AUTO_INCREMENT NOT NULL,
    num_factura INT NOT NULL,
    id_sesion INT NOT NULL, -- 👈 Crucial: Mapea exactamente qué sesión de horas se está cobrando aquí
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
    tipo VARCHAR(15) NOT NULL, -- Efectivo, Transferencia, Tarjeta
    num_factura INT NOT NULL, -- 👈 Corregido: El pago extingue la factura, no el tatuaje de forma directa
    CONSTRAINT PAGO_PK PRIMARY KEY (id_pago),
    CONSTRAINT PAGO_VALOR_CHK CHECK (valor > 0),
    CONSTRAINT PAGO_TIPO_CHK CHECK (tipo IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA')),
    CONSTRAINT PAGO_FACTURA_FK FOREIGN KEY (num_factura) REFERENCES FACTURA (num_factura)
);
