-- =====================================================================
-- RECREAR BASE DE DATOS COMPLETA - ART INK TATTOO STUDIO
-- Con ajustes: PROGRAMADO, tatuador_nombre en TARIFA, TARIFA_id_tarifa en TATUAJE
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS PAGO, DETALLE_FACTURA, FACTURA, SESION, TATUAJE, USUARIO, TARIFA, CLIENTE;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- 1. TABLAS INDEPENDIENTES
-- =====================================================================

CREATE TABLE CLIENTE (
    id_cliente INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(120) NOT NULL,
    CONSTRAINT CLIENTE_PK PRIMARY KEY (id_cliente)
);

CREATE TABLE TARIFA (
    id_tarifa INT NOT NULL,
    tipo_trabajo VARCHAR(60) NOT NULL,
    valor_hora DECIMAL(10,2) NOT NULL,
    tatuador_nombre VARCHAR(100) NULL,
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
    estado VARCHAR(15) NOT NULL,
    CONSTRAINT USUARIO_PK PRIMARY KEY (id_usuario),
    CONSTRAINT USUARIO__CORREO_UK UNIQUE (correo),
    CONSTRAINT USUARIO_ESTADO_CHK CHECK (estado IN ('ACTIVO', 'INACTIVO'))
);

-- =====================================================================
-- 2. TABLAS DEPENDIENTES
-- =====================================================================

CREATE TABLE TATUAJE (
    id_tatuaje INT NOT NULL,
    diseno VARCHAR(200) NOT NULL,
    zona_cuerpo VARCHAR(60) NOT NULL,
    estado VARCHAR(15) NOT NULL,
    horas_estimadas DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    valor_estimado DECIMAL(12,2) NOT NULL,
    anticipo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    fecha_finalizacion DATE,
    CLIENTE_id_cliente INT NOT NULL,
    TARIFA_id_tarifa INT NULL,
    CONSTRAINT TATUAJE_PK PRIMARY KEY (id_tatuaje),
    CONSTRAINT TATUAJE_ESTADO_CHK CHECK (estado IN ('PENDIENTE', 'PROGRAMADO', 'FINALIZADO', 'CANCELADO')),
    CONSTRAINT TATUAJE_VALOR_EST_CHK CHECK (valor_estimado >= 0),
    CONSTRAINT TATUAJE_ANTICIPO_CHK CHECK (anticipo >= 0),
    CONSTRAINT TATUAJE_ANTICIPO_VAL_CHK CHECK (anticipo <= valor_estimado),
    CONSTRAINT TATUAJE_HORAS_EST_CHK CHECK (horas_estimadas > 0),
    CONSTRAINT TATUAJE_CLIENTE_FK FOREIGN KEY (CLIENTE_id_cliente) REFERENCES CLIENTE (id_cliente),
    CONSTRAINT TATUAJE_TARIFA_FK FOREIGN KEY (TARIFA_id_tarifa) REFERENCES TARIFA (id_tarifa)
);

CREATE TABLE SESION (
    id_sesion INT NOT NULL,
    fecha DATE NOT NULL,
    duracion_horas DECIMAL(4,2) NOT NULL,
    es_retoque VARCHAR(1) NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    TATUAJE_id_tatuaje INT NOT NULL,
    USUARIO_id_usuario INT NOT NULL,
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
-- 3. FACTURACION Y PAGOS
-- =====================================================================

CREATE TABLE FACTURA (
    num_factura INT NOT NULL,
    fecha_emision DATE NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    TATUAJE_id_tatuaje INT NOT NULL,
    CONSTRAINT FACTURA_PK PRIMARY KEY (num_factura),
    CONSTRAINT FACTURA_TOTAL_CHK CHECK (total >= 0),
    CONSTRAINT FACTURA_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) REFERENCES TATUAJE (id_tatuaje)
);

CREATE TABLE DETALLE_FACTURA (
    id_detalle INT AUTO_INCREMENT NOT NULL,
    num_factura INT NOT NULL,
    id_sesion INT NOT NULL,
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
    tipo VARCHAR(15) NOT NULL,
    num_factura INT NOT NULL,
    CONSTRAINT PAGO_PK PRIMARY KEY (id_pago),
    CONSTRAINT PAGO_VALOR_CHK CHECK (valor > 0),
    CONSTRAINT PAGO_TIPO_CHK CHECK (tipo IN ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA')),
    CONSTRAINT PAGO_FACTURA_FK FOREIGN KEY (num_factura) REFERENCES FACTURA (num_factura)
);

-- =====================================================================
-- 4. DATOS DE EJEMPLO
-- =====================================================================

-- Usuario admin (clave: admin123)
INSERT INTO USUARIO (id_usuario, nombre, correo, clave, rol, estado) VALUES
(1, 'Administrador', 'admin@estudio.com', '$2b$10$q6cFfNtwLt.mPEkKkIQrHuO.wjUMQeluKSQnBDUyElIOOp6aGfqrO', 'ADMINISTRADOR', 'ACTIVO');

-- Clientes
INSERT INTO CLIENTE (id_cliente, nombre, telefono, correo) VALUES
(1025882833, 'Stefania Borja Medina', '3001234567', 'stefania@correo.com'),
(1098765432, 'Andres Mejia', '3109876543', 'andres.mejia@correo.com'),
(1012345678, 'Camila Restrepo', '3204567890', 'camila.r@correo.com'),
(1087654321, 'Santiago Ruiz', '3156789012', 'santi.ruiz@correo.com'),
(1054321098, 'Valentina Torres', '3008901234', 'vale.torres@correo.com');

-- Tarifas con tatuadores asignados
INSERT INTO TARIFA (id_tarifa, tipo_trabajo, valor_hora, tatuador_nombre) VALUES
(1, 'Blackwork', 225000, 'Carlos Ink'),
(2, 'Realismo', 300000, 'Laura Needles'),
(3, 'Tradicional Japones', 100000, 'Carlos Ink'),
(4, 'Minimalista', 80000, 'Daniela Art'),
(5, 'Acuarela', 180000, 'Laura Needles'),
(6, 'Geometrico', 150000, 'Daniela Art'),
(7, 'Lettering', 90000, 'Carlos Ink');

-- Tatuajes
INSERT INTO TATUAJE (id_tatuaje, diseno, zona_cuerpo, estado, horas_estimadas, valor_estimado, anticipo, fecha_finalizacion, CLIENTE_id_cliente, TARIFA_id_tarifa) VALUES
(101, 'Dragon Oriental', 'Espalda', 'PROGRAMADO', 8.00, 800000, 200000, NULL, 1025882833, 3),
(102, 'Rosa con Espinas', 'Antebrazo', 'PENDIENTE', 3.00, 900000, 100000, NULL, 1098765432, 2),
(103, 'Mandala Geometrico', 'Hombro', 'FINALIZADO', 4.00, 600000, 150000, '2026-09-20', 1012345678, 6),
(104, 'Retrato Mascota', 'Muslo', 'PENDIENTE', 6.00, 1800000, 300000, NULL, 1087654321, 2),
(105, 'Flor de Loto', 'Muneca', 'PENDIENTE', 2.00, 160000, 50000, NULL, 1054321098, 4);

-- Sesiones
INSERT INTO SESION (id_sesion, fecha, duracion_horas, es_retoque, valor, TATUAJE_id_tatuaje, USUARIO_id_usuario, TARIFA_id_tarifa) VALUES
(201, '2026-08-10', 4.00, 'N', 400000, 101, 1, 3),
(202, '2026-08-25', 3.00, 'N', 300000, 101, 1, 3),
(203, '2026-09-05', 4.00, 'N', 600000, 103, 1, 6);
