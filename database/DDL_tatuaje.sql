-- =====================================================================
-- 1. CREACIÓN DE TABLAS INDEPENDIENTES (Sin llaves foráneas iniciales)
-- =====================================================================
CREATE DATABASE tatuaje;
USE tatuaje;

CREATE TABLE CLIENTE 
    ( 
     id_cliente INT NOT NULL, 
     nombre     VARCHAR(100) NOT NULL, 
     telefono   VARCHAR(20) NOT NULL,
     CONSTRAINT CLIENTE_PK PRIMARY KEY (id_cliente)
    ) 
;


CREATE TABLE TARIFA 
    ( 
     id_tarifa    INT NOT NULL, 
     tipo_trabajo VARCHAR(60) NOT NULL, 
     valor_hora   DECIMAL(10,2) NOT NULL,
     CONSTRAINT TARIFA_PK PRIMARY KEY (id_tarifa),
     CONSTRAINT TARIFA__TIPO_UK UNIQUE (tipo_trabajo),
     CONSTRAINT TARIFA_VALOR_HORA_CHK CHECK (valor_hora > 0)
    ) 
;


CREATE TABLE USUARIO 
    ( 
     id_usuario INT NOT NULL, 
     nombre     VARCHAR(100) NOT NULL, 
     correo     VARCHAR(120) NOT NULL, 
     clave      VARCHAR(255) NOT NULL, 
     rol        VARCHAR(15) NOT NULL, 
     activo     VARCHAR(1) NOT NULL,
     CONSTRAINT USUARIO_PK PRIMARY KEY (id_usuario),
     CONSTRAINT USUARIO__CORREO_UK UNIQUE (correo),
     CONSTRAINT USUARIO_ACTIVO_CHK CHECK (activo IN ('S', 'N'))
    ) 
;


-- =====================================================================
-- 2. CREACIÓN DE TABLAS DEPENDIENTES (Con sus índices y CHECKS)
-- =====================================================================

CREATE TABLE TATUAJE 
    ( 
     id_tatuaje         INT NOT NULL, 
     diseno             VARCHAR(200) NOT NULL, 
     zona_cuerpo        VARCHAR(60) NOT NULL, 
     estado             VARCHAR(15) NOT NULL, 
     valor_estimado     DECIMAL(12,2), 
     fecha_finalizacion DATE, 
     CLIENTE_id_cliente INT NOT NULL,
     CONSTRAINT TATUAJE_PK PRIMARY KEY (id_tatuaje),
     CONSTRAINT TATUAJE_ESTADO_CHK CHECK (estado IN ('PENDIENTE', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO')),
     CONSTRAINT TATUAJE_VALOR_EST_CHK CHECK (valor_estimado >= 0)
    ) 
;


CREATE TABLE FACTURA 
    ( 
     num_factura        INT NOT NULL, 
     fecha_emision      DATE NOT NULL, 
     total              DECIMAL(12,2) NOT NULL, 
     TATUAJE_id_tatuaje INT NOT NULL,
     CONSTRAINT FACTURA_PK PRIMARY KEY (num_factura),
     CONSTRAINT FACTURA_TOTAL_CHK CHECK (total >= 0)
    ) 
;

-- En MySQL los índices únicos se pueden definir directamente en la estructura
ALTER TABLE FACTURA ADD CONSTRAINT FACTURA__IDX UNIQUE (TATUAJE_id_tatuaje);


CREATE TABLE PAGO 
    ( 
     id_pago            INT NOT NULL, 
     fecha              DATE NOT NULL, 
     valor              DECIMAL(12,2) NOT NULL, 
     tipo               VARCHAR(10) NOT NULL, 
     TATUAJE_id_tatuaje INT NOT NULL,
     CONSTRAINT PAGO_PK PRIMARY KEY (id_pago),
     CONSTRAINT PAGO_VALOR_CHK CHECK (valor > 0)
    ) 
;


CREATE TABLE SESION 
    ( 
     id_sesion          INT NOT NULL, 
     fecha              DATE NOT NULL, 
     duracion_horas     DECIMAL(4,2) NOT NULL, 
     es_retoque         VARCHAR(1) NOT NULL, 
     valor              DECIMAL(12,2) NOT NULL, 
     TATUAJE_id_tatuaje INT NOT NULL, 
     USUARIO_id_usuario INT NOT NULL, 
     TARIFA_id_tarifa   INT NOT NULL,
     CONSTRAINT SESION_PK PRIMARY KEY (id_sesion),
     CONSTRAINT SESION_RETOQUE_CHK CHECK (es_retoque IN ('S', 'N')),
     CONSTRAINT SESION_VALOR_CHK CHECK (valor >= 0),
     CONSTRAINT SESION_DURACION_CHK CHECK (duracion_horas > 0)
    ) 
;


-- =====================================================================
-- 3. ASIGNACIÓN DE LLAVES FORÁNEAS (FK)
-- =====================================================================

ALTER TABLE TATUAJE 
    ADD CONSTRAINT TATUAJE_CLIENTE_FK FOREIGN KEY (CLIENTE_id_cliente) 
    REFERENCES CLIENTE (id_cliente);

ALTER TABLE FACTURA 
    ADD CONSTRAINT FACTURA_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) 
    REFERENCES TATUAJE (id_tatuaje);

ALTER TABLE PAGO 
    ADD CONSTRAINT PAGO_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) 
    REFERENCES TATUAJE (id_tatuaje);

ALTER TABLE SESION 
    ADD CONSTRAINT SESION_TARIFA_FK FOREIGN KEY (TARIFA_id_tarifa) 
    REFERENCES TARIFA (id_tarifa);

ALTER TABLE SESION 
    ADD CONSTRAINT SESION_TATUAJE_FK FOREIGN KEY (TATUAJE_id_tatuaje) 
    REFERENCES TATUAJE (id_tatuaje);

ALTER TABLE SESION 
    ADD CONSTRAINT SESION_USUARIO_FK FOREIGN KEY (USUARIO_id_usuario) 
    REFERENCES USUARIO (id_usuario);
