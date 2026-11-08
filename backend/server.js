try {
  require("dotenv").config();
} catch (e) {}
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión dinámica para Railway o entorno local
const dbConnectionConfig =
  process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL
    ? (process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL)
    : {
        host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
        user: process.env.MYSQLUSER || process.env.DB_USER || "root",
        password:
          process.env.MYSQLPASSWORD !== undefined
            ? process.env.MYSQLPASSWORD
            : (process.env.DB_PASSWORD !== undefined
                ? process.env.DB_PASSWORD
                : ""),
        database:
          process.env.MYSQLDATABASE || process.env.DB_NAME || "railway",
        port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
      };

const db = mysql.createConnection(dbConnectionConfig);

// Comprobar la conexión
db.connect((error) => {
  if (error) {
    console.error("❌ Error al conectar a la base de datos:", error.message);
    return;
  }
  console.log("✅ ¡Conectado exitosamente a la base de datos MySQL!");
});

// Helper para autogenerar identificadores automáticos y liberar al frontend de IDs manuales
const obtenerSiguienteId = (tabla, columna) => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT COALESCE(MAX(${columna}), 0) + 1 AS siguiente FROM ${tabla}`, (err, res) => {
      if (err) return reject(err);
      resolve(res[0].siguiente);
    });
  });
};

// ==========================================
//          ENDPOINTS DE USUARIOS & LOGIN (HU-10, HU-11)
// ==========================================

// 1. Iniciar Sesión con Verificación de Bcrypt (HU-10)
app.post("/api/login", (req, res) => {
  const { correo, clave } = req.body;

  // Buscamos el usuario únicamente por su correo
  const query =
    "SELECT id_usuario, nombre, correo, clave, rol, estado FROM USUARIO WHERE correo = ?";

  db.query(query, [correo], async (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });

    // Si no encuentra el correo
    if (resultados.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const usuario = resultados[0];

    // Validamos si el usuario está activo antes de verificar la clave
    if (usuario.estado === "INACTIVO") {
      return res.status(403).json({ error: "El usuario está inactivo" });
    }

    try {
      // Comparamos la contraseña en texto plano con el hash de la base de datos
      const coincide = await bcrypt.compare(clave, usuario.clave);

      if (!coincide) {
        return res.status(401).json({ error: "Credenciales incorrectas" });
      }

      // Si coincide, respondemos con los datos del usuario (quitando la clave por seguridad)
      return res.json({
        mensaje: "Inicio de sesión exitoso",
        usuario: {
          id_usuario: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error al verificar las credenciales" });
    }
  });
});

// 2. Registrar un nuevo Tatuador/Usuario con encriptación (HU-11)
app.get("/api/usuarios/siguiente-id", (req, res) => {
  db.query("SELECT COALESCE(MAX(id_usuario), 0) + 1 AS siguiente FROM USUARIO", (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: r[0].siguiente });
  });
});

app.post("/api/usuarios", async (req, res) => {
  const { id_usuario, nombre, correo, clave, rol } = req.body;
  const estado = "ACTIVO";

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre del colaborador es obligatorio." });
  }
  if (!correo || !correo.trim()) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  // Validación de formato de correo (CP-33)
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexCorreo.test(correo.trim())) {
    return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
  }

  if (!clave || !clave.trim()) {
    return res.status(400).json({ error: "La contraseña es obligatoria." });
  }

  try {
    const idFinal = id_usuario ? parseInt(id_usuario) : await obtenerSiguienteId("USUARIO", "id_usuario");

    // 1. Validamos si el correo ya existe (CP-32)
    const checkQuery = "SELECT * FROM USUARIO WHERE correo = ?";
    db.query(checkQuery, [correo.trim()], async (err, fila) => {
      if (err) return res.status(500).json({ error: err.message });
      if (fila.length > 0) {
        return res.status(400).json({ error: "El correo ya está en uso." });
      }

      try {
        // 2. Encriptamos la contraseña (10 rondas de salting son el estándar)
        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(clave.trim(), saltRounds);

        // 3. Insertamos el registro con la clave protegida
        const query =
          "INSERT INTO USUARIO (id_usuario, nombre, correo, clave, rol, estado) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(
          query,
          [idFinal, nombre.trim(), correo.trim(), claveEncriptada, rol || "TATUADOR", estado],
          (err, resultado) => {
            if (err) {
              if (err.errno === 1062) {
                return res.status(409).json({ error: "Ya existe un usuario con ese correo o identificador." });
              }
              return res.status(500).json({ error: err.message });
            }
            return res.json({
              mensaje: "Colaborador registrado con éxito.",
              id: idFinal,
            });
          },
        );
      } catch (error) {
        return res
          .status(500)
          .json({ error: "Error al procesar la seguridad de la contraseña" });
      }
    });
  } catch (errId) {
    return res.status(500).json({ error: "Error generando identificador de usuario: " + errId.message });
  }
});

// Obtener la lista de usuarios/tatuadores activos
app.get("/api/usuarios", (req, res) => {
  const query =
    "SELECT id_usuario, nombre, correo, rol, estado FROM USUARIO WHERE estado = 'ACTIVO'";
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// ==========================================
//          ENDPOINTS DE SESIONES (HU-02, HU-03)
// ==========================================

// 1. Registrar una nueva sesión de trabajo (HU-02)
app.post("/api/sesiones", async (req, res) => {
  const {
    id_sesion,
    fecha,
    duracion_horas,
    es_retoque,
    valor,
    TATUAJE_id_tatuaje,
    USUARIO_id_usuario,
    TARIFA_id_tarifa,
    ultima_sesion,
  } = req.body;

  if (parseFloat(duracion_horas) <= 0) {
    return res
      .status(400)
      .json({ error: "La duración de la sesión debe ser mayor a cero horas." });
  }

  try {
    const idFinal = id_sesion ? parseInt(id_sesion) : await obtenerSiguienteId("SESION", "id_sesion");

    const query = `
          INSERT INTO SESION (id_sesion, fecha, duracion_horas, es_retoque, valor, TATUAJE_id_tatuaje, USUARIO_id_usuario, TARIFA_id_tarifa)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

    db.query(
      query,
      [
        idFinal,
        fecha,
        duracion_horas,
        es_retoque,
        valor,
        TATUAJE_id_tatuaje,
        USUARIO_id_usuario,
        TARIFA_id_tarifa,
      ],
      (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });

        const actualizarEstado = (cb) => {
          if (ultima_sesion && TATUAJE_id_tatuaje) {
            const hoy = new Date().toISOString().split("T")[0];
            db.query(
              "UPDATE TATUAJE SET estado = 'FINALIZADO', fecha_finalizacion = COALESCE(fecha_finalizacion, ?) WHERE id_tatuaje = ?",
              [hoy, TATUAJE_id_tatuaje],
              () => cb()
            );
          } else if (es_retoque === "N" && TATUAJE_id_tatuaje) {
            db.query(
              "UPDATE TATUAJE SET estado = 'PROGRAMADO' WHERE id_tatuaje = ? AND estado = 'PENDIENTE'",
              [TATUAJE_id_tatuaje],
              () => cb()
            );
          } else {
            cb();
          }
        };

        actualizarEstado(() => {
          return res.json({
            mensaje: ultima_sesion
              ? "Sesión registrada y tatuaje marcado como finalizado."
              : "Sesión de trabajo registrada con éxito",
            id: idFinal,
          });
        });
      },
    );
  } catch (errId) {
    return res.status(500).json({ error: "Error generando identificador de sesión: " + errId.message });
  }
});

// 2. Obtener el historial de sesiones agrupadas o filtradas por tatuaje (HU-03)
app.get("/api/sesiones/tatuaje/:id", (req, res) => {
  const tatuaje_id = req.params.id;

  const query = `
        SELECT s.*, u.nombre AS nombre_tatuador, t.tipo_trabajo
        FROM SESION s
        JOIN USUARIO u ON s.USUARIO_id_usuario = u.id_usuario
        JOIN TARIFA t ON s.TARIFA_id_tarifa = t.id_tarifa
        WHERE s.TATUAJE_id_tatuaje = ?
        ORDER BY s.fecha DESC
    `;

  db.query(query, [tatuaje_id], (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// ==========================================
//          ENDPOINTS DE TARIFAS (HU-04)
// ==========================================

// 1. Obtener todas las tarifas configuradas
app.get("/api/tarifas", (req, res) => {
  const query = "SELECT * FROM TARIFA";
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// 2. Crear una nueva tarifa base
app.post("/api/tarifas", async (req, res) => {
  const { id_tarifa, tipo_trabajo, valor_hora, tatuador_nombre } = req.body;

  if (!tipo_trabajo || !tipo_trabajo.trim()) {
    return res.status(400).json({ error: "El tipo de trabajo es obligatorio." });
  }
  if (!valor_hora || isNaN(valor_hora) || parseFloat(valor_hora) <= 0) {
    return res.status(400).json({ error: "El valor por hora debe ser un número mayor a cero." });
  }

  try {
    const idFinal = id_tarifa ? parseInt(id_tarifa) : await obtenerSiguienteId("TARIFA", "id_tarifa");

    const query =
      "INSERT INTO TARIFA (id_tarifa, tipo_trabajo, valor_hora, tatuador_nombre) VALUES (?, ?, ?, ?)";

    db.query(query, [idFinal, tipo_trabajo.trim(), parseFloat(valor_hora), tatuador_nombre || null], (err, resultado) => {
      if (err) {
        if (err.errno === 1062) {
          return res.status(409).json({ error: `Ya existe una tarifa configurada para el tipo de trabajo "${tipo_trabajo.trim()}".` });
        }
        return res.status(500).json({ error: err.message });
      }
      return res.json({ mensaje: "Tarifa configurada con éxito", id: idFinal });
    });
  } catch (errId) {
    return res.status(500).json({ error: "Error generando identificador de tarifa: " + errId.message });
  }
});

// 3. Editar una tarifa existente
app.put("/api/tarifas/:id", (req, res) => {
  const { id } = req.params;
  const { tipo_trabajo, valor_hora, tatuador_nombre } = req.body;
  const query = "UPDATE TARIFA SET tipo_trabajo = ?, valor_hora = ?, tatuador_nombre = ? WHERE id_tarifa = ?";
  db.query(query, [tipo_trabajo, valor_hora, tatuador_nombre || null, id], (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Tarifa no encontrada." });
    return res.json({ mensaje: "Tarifa actualizada con éxito" });
  });
});

// ==========================================
//          ACTUALIZAR ESTADO DE TATUAJE
// ==========================================

app.put("/api/tatuajes/:id/estado", (req, res) => {
  const { id } = req.params;
  const { estado, fecha_finalizacion } = req.body;

  const estadosValidos = ["PENDIENTE", "PROGRAMADO", "FINALIZADO", "CANCELADO"];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: "Estado no válido." });
  }

  let query, params;
  if (estado === "FINALIZADO") {
    const fecha = fecha_finalizacion || new Date().toISOString().split("T")[0];
    query = "UPDATE TATUAJE SET estado = ?, fecha_finalizacion = ? WHERE id_tatuaje = ?";
    params = [estado, fecha, id];
  } else {
    query = "UPDATE TATUAJE SET estado = ?, fecha_finalizacion = NULL WHERE id_tatuaje = ?";
    params = [estado, id];
  }

  db.query(query, params, (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: "Tatuaje no encontrado." });
    }
    return res.json({ mensaje: `Estado actualizado a ${estado}` });
  });
});

// ==========================================
//          OBTENER DETALLE DE FACTURA
// ==========================================

app.get("/api/facturas/:num/detalle", (req, res) => {
  const num = req.params.num;

  const queryFactura = `
    SELECT f.num_factura, f.fecha_emision, f.total,
           t.diseno, t.zona_cuerpo, t.valor_estimado, t.anticipo,
           c.id_cliente, c.nombre AS nombre_cliente, c.telefono, c.correo AS correo_cliente
    FROM FACTURA f
    JOIN TATUAJE t ON f.TATUAJE_id_tatuaje = t.id_tatuaje
    JOIN CLIENTE c ON t.CLIENTE_id_cliente = c.id_cliente
    WHERE f.num_factura = ?
  `;

  db.query(queryFactura, [num], (err, facturaRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (facturaRows.length === 0) return res.status(404).json({ error: "Factura no encontrada." });

    const factura = facturaRows[0];

    const queryDetalle = `
      SELECT df.horas_facturadas, df.valor_unitario, df.subtotal,
             s.fecha, s.es_retoque, u.nombre AS nombre_tatuador, u.id_usuario,
             tar.tipo_trabajo
      FROM DETALLE_FACTURA df
      JOIN SESION s ON df.id_sesion = s.id_sesion
      JOIN USUARIO u ON s.USUARIO_id_usuario = u.id_usuario
      JOIN TARIFA tar ON s.TARIFA_id_tarifa = tar.id_tarifa
      WHERE df.num_factura = ?
    `;

    db.query(queryDetalle, [num], (errD, detalles) => {
      if (errD) return res.status(500).json({ error: errD.message });
      return res.json({ ...factura, detalles });
    });
  });
});

// ==========================================
//          LISTAR TODAS LAS FACTURAS
// ==========================================

app.get("/api/facturas/siguiente-numero", (req, res) => {
  db.query("SELECT COALESCE(MAX(num_factura), 0) + 1 AS siguiente FROM FACTURA", (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: resultados[0].siguiente });
  });
});

app.get("/api/facturas", (req, res) => {
  const query = `
    SELECT f.num_factura, f.fecha_emision, f.total, t.diseno, c.nombre AS nombre_cliente
    FROM FACTURA f
    JOIN TATUAJE t ON f.TATUAJE_id_tatuaje = t.id_tatuaje
    JOIN CLIENTE c ON t.CLIENTE_id_cliente = c.id_cliente
    ORDER BY f.num_factura DESC
  `;
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// ==========================================
//          ENDPOINTS DE CLIENTES
// ==========================================

// Siguiente ID recomendado para cliente
app.get("/api/clientes/siguiente-id", (req, res) => {
  db.query("SELECT COALESCE(MAX(id_cliente), 0) + 1 AS siguiente FROM CLIENTE", (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: r[0].siguiente });
  });
});

// 1. Obtener todos los clientes
app.get("/api/clientes", (req, res) => {
  const query = "SELECT * FROM CLIENTE";
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// 2. Registrar un nuevo cliente
// Registrar un nuevo cliente (HU-01 con soporte para Correo)
app.post("/api/clientes", async (req, res) => {
  const { id_cliente, nombre, telefono, correo } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: "El nombre del cliente es obligatorio." });
  }
  if (!telefono || !telefono.trim()) {
    return res.status(400).json({ error: "El teléfono de contacto es obligatorio." });
  }
  if (!correo || !correo.trim()) {
    return res.status(400).json({ error: "El correo electrónico es obligatorio." });
  }

  try {
    const idFinal = id_cliente ? parseInt(id_cliente) : await obtenerSiguienteId("CLIENTE", "id_cliente");

    const query =
      "INSERT INTO CLIENTE (id_cliente, nombre, telefono, correo) VALUES (?, ?, ?, ?)";

    db.query(
      query,
      [idFinal, nombre.trim(), telefono.trim(), correo.trim()],
      (err, resultado) => {
        if (err) {
          if (err.errno === 1062) {
            return res.status(409).json({ error: "Ya existe un cliente registrado con ese número de identificación." });
          }
          return res.status(500).json({ error: err.message });
        }
        return res.json({
          mensaje: "Cliente registrado con éxito en el sistema.",
          id: idFinal,
        });
      },
    );
  } catch (errId) {
    return res.status(500).json({ error: "Error generando identificador de cliente: " + errId.message });
  }
});

// 3. Editar un cliente existente
app.put("/api/clientes/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, telefono, correo } = req.body;
  const query = "UPDATE CLIENTE SET nombre = ?, telefono = ?, correo = ? WHERE id_cliente = ?";
  db.query(query, [nombre, telefono, correo, id], (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultado.affectedRows === 0) return res.status(404).json({ error: "Cliente no encontrado." });
    return res.json({ mensaje: "Cliente actualizado con éxito" });
  });
});

// ==========================================
//    HISTORIAL DE PAGOS Y SALDO (HU-08)
// ==========================================

// Siguiente ID recomendado para Pago
app.get("/api/pagos/siguiente-id", (req, res) => {
  db.query("SELECT COALESCE(MAX(id_pago), 0) + 1 AS siguiente FROM PAGO", (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: r[0].siguiente });
  });
});

// Registrar un nuevo pago/abono a una factura
app.post("/api/pagos", async (req, res) => {
  const { id_pago, fecha, valor, tipo, num_factura } = req.body;
  if (!fecha) return res.status(400).json({ error: "La fecha del pago es obligatoria." });
  if (!valor || parseFloat(valor) <= 0) return res.status(400).json({ error: "El valor del pago debe ser mayor a cero." });
  if (!num_factura) return res.status(400).json({ error: "Debe asociar el pago a una factura." });

  const tiposValidos = ["EFECTIVO", "TRANSFERENCIA", "TARJETA"];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: "El tipo de pago debe ser EFECTIVO, TRANSFERENCIA o TARJETA." });
  }

  try {
    const idFinal = id_pago ? parseInt(id_pago) : await obtenerSiguienteId("PAGO", "id_pago");

    const query = "INSERT INTO PAGO (id_pago, fecha, valor, tipo, num_factura) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [idFinal, fecha, valor, tipo, num_factura], (err, resultado) => {
      if (err) {
        if (err.errno === 1062) {
          return res.status(409).json({ error: "Ya existe un pago registrado con ese ID." });
        }
        return res.status(500).json({ error: err.message });
      }
      return res.json({ mensaje: "Pago registrado exitosamente en el sistema.", id: idFinal });
    });
  } catch (errId) {
    return res.status(500).json({ error: "Error generando identificador de pago: " + errId.message });
  }
});

// Consultar estado de cuenta e historial de pagos de un cliente (HU-08 / CP-22 y CP-23)
app.get("/api/clientes/:id/estado-cuenta", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM CLIENTE WHERE id_cliente = ?", [id], (errC, clientes) => {
    if (errC) return res.status(500).json({ error: errC.message });
    if (clientes.length === 0) return res.status(404).json({ error: "Cliente no encontrado." });
    const cliente = clientes[0];

    const queryFacturas = `
      SELECT f.num_factura, f.fecha_emision, f.total AS total_neto,
             t.id_tatuaje, t.diseno, t.anticipo,
             COALESCE((SELECT SUM(p.valor) FROM PAGO p WHERE p.num_factura = f.num_factura), 0) AS total_abonos
      FROM FACTURA f
      JOIN TATUAJE t ON f.TATUAJE_id_tatuaje = t.id_tatuaje
      WHERE t.CLIENTE_id_cliente = ?
      ORDER BY f.fecha_emision DESC
    `;

    db.query(queryFacturas, [id], (errF, facturas) => {
      if (errF) return res.status(500).json({ error: errF.message });

      const queryPagos = `
        SELECT p.id_pago, p.fecha, p.valor, p.tipo, p.num_factura, t.diseno
        FROM PAGO p
        JOIN FACTURA f ON p.num_factura = f.num_factura
        JOIN TATUAJE t ON f.TATUAJE_id_tatuaje = t.id_tatuaje
        WHERE t.CLIENTE_id_cliente = ?
        ORDER BY p.fecha DESC
      `;

      db.query(queryPagos, [id], (errP, pagos) => {
        if (errP) return res.status(500).json({ error: errP.message });

        let totalFacturado = 0;
        let totalAnticipos = 0;
        let totalAbonos = 0;

        const facturasProcesadas = facturas.map((f) => {
          const anticipo = parseFloat(f.anticipo || 0);
          const totalNeto = parseFloat(f.total_neto || 0);
          const bruto = totalNeto + anticipo;
          const abonos = parseFloat(f.total_abonos || 0);
          const saldo = Math.max(0, totalNeto - abonos);

          totalFacturado += bruto;
          totalAnticipos += anticipo;
          totalAbonos += abonos;

          return {
            ...f,
            valor_bruto: bruto,
            saldo_pendiente: saldo,
            esta_pagada: saldo <= 0,
          };
        });

        const totalPagado = totalAnticipos + totalAbonos;
        const saldoPendiente = Math.max(0, totalFacturado - totalPagado);

        const movimientos = [];
        facturas.forEach((f) => {
          if (parseFloat(f.anticipo) > 0) {
            movimientos.push({
              fecha: f.fecha_emision,
              concepto: `Anticipo agendamiento — ${f.diseno}`,
              tipo: "ANTICIPO",
              valor: parseFloat(f.anticipo),
              signo: "PAGADO",
            });
          }
          movimientos.push({
            fecha: f.fecha_emision,
            concepto: `Factura emitida #${f.num_factura} — ${f.diseno}`,
            tipo: "FACTURA",
            valor: parseFloat(f.total_neto) + parseFloat(f.anticipo || 0),
            signo: "CARGO",
          });
        });

        pagos.forEach((p) => {
          movimientos.push({
            fecha: p.fecha,
            concepto: `Abono a Factura #${p.num_factura} (${p.tipo}) — ${p.diseno}`,
            tipo: "ABONO",
            valor: parseFloat(p.valor),
            signo: "PAGADO",
          });
        });

        movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return res.json({
          cliente,
          facturas: facturasProcesadas,
          pagos,
          movimientos,
          totales: {
            total_facturado: totalFacturado,
            total_anticipos: totalAnticipos,
            total_abonos: totalAbonos,
            total_pagado: totalPagado,
            saldo_pendiente: saldoPendiente,
            al_dia: saldoPendiente <= 0,
          },
        });
      });
    });
  });
});

// ==========================================
//          ENDPOINTS DE TATUAJES
// ==========================================

// Siguiente ID recomendado para tatuaje
app.get("/api/tatuajes/siguiente-id", (req, res) => {
  db.query("SELECT COALESCE(MAX(id_tatuaje), 0) + 1 AS siguiente FROM TATUAJE", (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: r[0].siguiente });
  });
});

// Siguiente ID recomendado para sesion
app.get("/api/sesiones/siguiente-id", (req, res) => {
  db.query("SELECT COALESCE(MAX(id_sesion), 0) + 1 AS siguiente FROM SESION", (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: r[0].siguiente });
  });
});

// Siguiente ID recomendado para tarifa
app.get("/api/tarifas/siguiente-id", (req, res) => {
  db.query("SELECT COALESCE(MAX(id_tarifa), 0) + 1 AS siguiente FROM TARIFA", (err, r) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ siguiente: r[0].siguiente });
  });
});

// 3. Obtener todos los tatuajes con la información de su cliente (JOIN)
app.get("/api/tatuajes", (req, res) => {
  const query = `
        SELECT t.*, c.nombre AS nombre_cliente,
          tar.tipo_trabajo, tar.valor_hora, tar.tatuador_nombre,
          (SELECT GROUP_CONCAT(s.id_sesion ORDER BY s.id_sesion SEPARATOR ', ')
           FROM SESION s WHERE s.TATUAJE_id_tatuaje = t.id_tatuaje) AS sesiones_ids,
          (SELECT COALESCE(SUM(s.duracion_horas), 0)
           FROM SESION s WHERE s.TATUAJE_id_tatuaje = t.id_tatuaje) AS horas_trabajadas_acumuladas
        FROM TATUAJE t
        JOIN CLIENTE c ON t.CLIENTE_id_cliente = c.id_cliente
        LEFT JOIN TARIFA tar ON t.TARIFA_id_tarifa = tar.id_tarifa
        ORDER BY t.id_tatuaje DESC
    `;
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// 4. Crear un nuevo tatuaje asociado a un cliente
// ==========================================
//        REGISTRAR TATUAJE CON ANTICIPO (HU-05)
// ==========================================
app.post("/api/tatuajes", async (req, res) => {
  const {
    id_tatuaje,
    diseno,
    zona_cuerpo,
    estado,
    horas_estimadas,
    valor_estimado,
    anticipo,
    fecha_finalizacion,
    CLIENTE_id_cliente,
    TARIFA_id_tarifa,
  } = req.body;

  if (parseFloat(anticipo) > parseFloat(valor_estimado)) {
    return res.status(400).json({
      error:
        "Alerta: El valor del anticipo no puede superar el valor estimado del tatuaje.",
    });
  }

  try {
    const idFinal = id_tatuaje ? parseInt(id_tatuaje) : await obtenerSiguienteId("TATUAJE", "id_tatuaje");

    const query = `
          INSERT INTO TATUAJE (id_tatuaje, diseno, zona_cuerpo, estado, horas_estimadas, valor_estimado, anticipo, fecha_finalizacion, CLIENTE_id_cliente, TARIFA_id_tarifa)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    db.query(
      query,
      [
        idFinal,
        diseno,
        zona_cuerpo,
        estado,
        horas_estimadas,
        valor_estimado,
        anticipo,
        fecha_finalizacion,
        CLIENTE_id_cliente,
        TARIFA_id_tarifa || null,
      ],
      (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({
          mensaje: "Tatuaje y anticipo registrados con éxito",
          id: idFinal,
        });
      },
    );
  } catch (errId) {
    return res.status(500).json({ error: "Error generando identificador de tatuaje: " + errId.message });
  }
});

// ==========================================
//      RESUMEN Y EMISIÓN EN 3FN (HU-06)
// ==========================================

// 1. Obtener sesiones pendientes Y jalar el anticipo de la base de datos
app.get("/api/facturacion/resumen/:tatuaje_id", (req, res) => {
  const tatuajeId = req.params.tatuaje_id;
  const soloRetoques = req.query.solo_retoques === "1";

  const queryTatuaje =
    "SELECT diseno, anticipo, valor_estimado FROM TATUAJE WHERE id_tatuaje = ?";

  db.query(queryTatuaje, [tatuajeId], (err, datosTatuaje) => {
    if (err) return res.status(500).json({ error: err.message });
    if (datosTatuaje.length === 0)
      return res.status(404).json({ error: "Tatuaje no encontrado." });

    const tatuajeInfo = datosTatuaje[0];

    const filtroRetoque = soloRetoques ? "AND s.es_retoque = 'S'" : "";
    const querySesiones = `
            SELECT s.id_sesion, s.fecha, s.duracion_horas, s.valor, s.es_retoque, t.tipo_trabajo
            FROM SESION s
            JOIN TARIFA t ON s.TARIFA_id_tarifa = t.id_tarifa
            WHERE s.TATUAJE_id_tatuaje = ?
            AND s.id_sesion NOT IN (SELECT id_sesion FROM DETALLE_FACTURA)
            ${filtroRetoque}
        `;

    db.query(querySesiones, [tatuajeId], (errS, sesiones) => {
      if (errS) return res.status(500).json({ error: errS.message });

      if (sesiones.length === 0) {
        return res.status(404).json({
          error: soloRetoques
            ? "Este tatuaje no tiene retoques pendientes por facturar."
            : "Este tatuaje no tiene nuevas sesiones de trabajo pendientes por facturar.",
        });
      }

      const total_calculado = sesiones.reduce(
        (sum, s) => sum + parseFloat(s.valor),
        0,
      );

      return res.json({
        tatuaje_id: tatuajeId,
        diseno: tatuajeInfo.diseno,
        anticipo_guardado: soloRetoques ? 0 : tatuajeInfo.anticipo,
        total_sesiones: sesiones.length,
        total_calculado: total_calculado,
        sesiones_detalladas: sesiones,
      });
    });
  });
});

// ==========================================
//          VALIDACIÓN DE RETOQUES (HU-07)
// ==========================================

// Validar si el retoque es gratuito o pago según los días transcurridos
app.get("/api/tatuajes/validar-retoque/:id", (req, res) => {
  const tatuajeId = req.params.id;

  const query =
    "SELECT estado, fecha_finalizacion FROM TATUAJE WHERE id_tatuaje = ?";

  db.query(query, [tatuajeId], (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    if (resultados.length === 0)
      return res.status(404).json({ error: "Tatuaje no encontrado." });

    const tatuaje = resultados[0];

    // Si el tatuaje ni siquiera está FINALIZADO, no debería tener retoques técnicos post-curación
    if (tatuaje.estado !== "FINALIZADO" || !tatuaje.fecha_finalizacion) {
      return res.json({
        califica_gratis: false,
        mensaje:
          "El tatuaje no registra una fecha de finalización previa. Se aplicará cobro normal.",
      });
    }

    // Calcular la diferencia exacta de días normalizando a medianoche calendario
    const strFin = new Date(tatuaje.fecha_finalizacion).toISOString().split("T")[0];
    const [yF, mF, dF] = strFin.split("-").map(Number);
    const dFin = new Date(yF, mF - 1, dF);

    const hoy = new Date();
    const dHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const diferenciaTiempo = Math.max(0, dHoy.getTime() - dFin.getTime());
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diferenciaDias <= 30) {
      return res.json({
        califica_gratis: true,
        dias_transcurridos: diferenciaDias,
        mensaje: `¡Retoque Gratuito! Está dentro del plazo legal (Días transcurridos: ${diferenciaDias}/30).`,
      });
    } else {
      return res.json({
        califica_gratis: false,
        dias_transcurridos: diferenciaDias,
        mensaje: `Retoque con Costo Adicional. Superó el plazo de 30 días (Días transcurridos: ${diferenciaDias}).`,
      });
    }
  });
});

// 2. Emitir Factura con su Detalle de forma Transaccional (HU-06)
app.post("/api/facturas", async (req, res) => {
  const {
    num_factura,
    fecha_emision,
    total,
    TATUAJE_id_tatuaje,
    sesiones_facturar,
  } = req.body;

  try {
    const numFinal = num_factura ? parseInt(num_factura) : await obtenerSiguienteId("FACTURA", "num_factura");

    // Insertamos primero el encabezado de la Factura
    const queryFactura =
      "INSERT INTO FACTURA (num_factura, fecha_emision, total, TATUAJE_id_tatuaje) VALUES (?, ?, ?, ?)";

    db.query(
      queryFactura,
      [numFinal, fecha_emision, total, TATUAJE_id_tatuaje],
      (err, resultado) => {
        if (err)
          return res.status(500).json({
            error: "Error al crear el encabezado de la factura: " + err.message,
          });

        // Insertamos en bucle cada sesión en la tabla DETALLE_FACTURA
        const queryDetalle =
          "INSERT INTO DETALLE_FACTURA (num_factura, id_sesion, horas_facturadas, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";

        // Usamos promesas mapeadas para asegurar que todos los detalles se guarden
        const promesasDetalles = sesiones_facturar.map((sesion) => {
          return new Promise((resolve, reject) => {
            // El valor unitario simulado es el valor total de la sesión dividido sus horas
            const valorUnitario =
              parseFloat(sesion.valor) / parseFloat(sesion.duracion_horas);
            db.query(
              queryDetalle,
              [
                numFinal,
                sesion.id_sesion,
                sesion.duracion_horas,
                valorUnitario,
                sesion.valor,
              ],
              (errD) => (errD ? reject(errD) : resolve()),
            );
          });
        });

        Promise.all(promesasDetalles)
          .then(() => {
            const hoy = new Date().toISOString().split("T")[0];
            db.query(
              "UPDATE TATUAJE SET estado = 'FINALIZADO', fecha_finalizacion = COALESCE(fecha_finalizacion, ?) WHERE id_tatuaje = ?",
              [hoy, TATUAJE_id_tatuaje],
              () => {}
            );
            return res.json({
              mensaje:
                "Factura emitida y tatuaje marcado como finalizado.",
              num_factura: numFinal,
            });
          })
          .catch((errorDetalle) => {
            return res.status(500).json({
              error:
                "Factura creada pero hubo un error en el desglose: " +
                errorDetalle.message,
            });
          });
      },
    );
  } catch (errId) {
    return res.status(500).json({ error: "Error generando número de factura: " + errId.message });
  }
});

// ==========================================================================
//          ENDPOINTS DE REPORTES Y COMISIONES (HU-08, HU-09)
// ==========================================================================

// Middleware de control de acceso para reportes administrativos (HU-09 / CP-26)
const verificarRolAdmin = (req, res, next) => {
  const rol = req.headers["x-user-rol"] || req.query.rol;
  if (rol && rol !== "ADMINISTRADOR") {
    return res.status(403).json({
      error: "Acceso denegado: solo el administrador tiene permisos para consultar los reportes de facturación del estudio.",
    });
  }
  next();
};

// 1. Reporte consolidado por rango de fechas y Tatuadores (HU-09)
app.get("/api/reportes/comisiones", verificarRolAdmin, (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio || !fecha_fin) {
    return res
      .status(400)
      .json({ error: "Por favor proporcione ambas fechas para el filtro." });
  }

  if (new Date(fecha_inicio) > new Date(fecha_fin)) {
    return res
      .status(400)
      .json({ error: "El rango de fechas es inválido: la fecha de inicio no puede ser posterior a la fecha final." });
  }

  const query = `
        SELECT
            u.id_usuario,
            u.nombre AS nombre_tatuador,
            COUNT(DISTINCT f.num_factura) AS facturas_emitidas,
            SUM(df.subtotal) AS bruto_trabajado,
            -- Simulación de regla de negocio: 50% de comisión para el artista
            SUM(df.subtotal) * 0.50 AS comision_tatuador,
            SUM(df.subtotal) * 0.50 AS ganancia_estudio
        FROM USUARIO u
        JOIN SESION s ON u.id_usuario = s.USUARIO_id_usuario
        JOIN DETALLE_FACTURA df ON s.id_sesion = df.id_sesion
        JOIN FACTURA f ON df.num_factura = f.num_factura
        WHERE f.fecha_emision BETWEEN ? AND ?
        GROUP BY u.id_usuario, u.nombre
    `;

  db.query(query, [fecha_inicio, fecha_fin], (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// 2. Historial de ingresos globales registrados en la caja (HU-08)
app.get("/api/reportes/historial-facturas", (req, res) => {
  const query = `
        SELECT f.num_factura, f.fecha_emision, f.total, t.diseno, c.nombre AS nombre_cliente
        FROM FACTURA f
        JOIN TATUAJE t ON f.TATUAJE_id_tatuaje = t.id_tatuaje
        JOIN CLIENTE c ON t.CLIENTE_id_cliente = c.id_cliente
        ORDER BY f.fecha_emision DESC
    `;

  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// Iniciar servidor
const PUERTO = process.env.PORT || 5000;
app.listen(PUERTO, "0.0.0.0", () => {
  console.log(`🚀 Servidor backend corriendo en puerto ${PUERTO}`);
});
