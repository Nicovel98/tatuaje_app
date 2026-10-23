const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
app.post("/api/usuarios", (req, res) => {
  const { id_usuario, nombre, correo, clave, rol } = req.body;
  const estado = "ACTIVO";

  // 1. Validamos si el correo ya existe
  const checkQuery = "SELECT * FROM USUARIO WHERE correo = ?";
  db.query(checkQuery, [correo], async (err, fila) => {
    if (err) return res.status(500).json({ error: err.message });
    if (fila.length > 0) {
      return res.status(400).json({ error: "El correo ya está en uso" });
    }

    try {
      // 2. Encriptamos la contraseña (10 rondas de salting son el estándar)
      const saltRounds = 10;
      const claveEncriptada = await bcrypt.hash(clave, saltRounds);

      // 3. Insertamos el registro con la clave protegida
      const query =
        "INSERT INTO USUARIO (id_usuario, nombre, correo, clave, rol, estado) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [id_usuario, nombre, correo, claveEncriptada, rol, estado],
        (err, resultado) => {
          if (err) return res.status(500).json({ error: err.message });
          return res.json({
            mensaje: "Colaborador registrado con éxito",
            id: id_usuario,
          });
        },
      );
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Error al procesar la seguridad de la contraseña" });
    }
  });
});

// Obtener la lista de usuarios/tatuadores activos
app.get("/api/usuarios", (req, res) => {
  const query =
    "SELECT id_usuario, nombre, correo, rol, activo FROM USUARIO WHERE activo = 'S'";
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// ==========================================
//          ENDPOINTS DE SESIONES (HU-02, HU-03)
// ==========================================

// 1. Registrar una nueva sesión de trabajo (HU-02)
app.post("/api/sesiones", (req, res) => {
  const {
    id_sesion,
    fecha,
    duracion_horas,
    es_retoque,
    valor,
    TATUAJE_id_tatuaje,
    USUARIO_id_usuario,
    TARIFA_id_tarifa,
  } = req.body;

  // Validación de negocio (Regla de calidad: Duración mayor a cero)
  if (parseFloat(duracion_horas) <= 0) {
    return res
      .status(400)
      .json({ error: "La duración de la sesión debe ser mayor a cero horas." });
  }

  const query = `
        INSERT INTO SESION (id_sesion, fecha, duracion_horas, es_retoque, valor, TATUAJE_id_tatuaje, USUARIO_id_usuario, TARIFA_id_tarifa)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [
      id_sesion,
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
      return res.json({
        mensaje: "Sesión de trabajo registrada con éxito",
        id: id_sesion,
      });
    },
  );
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
app.post("/api/tarifas", (req, res) => {
  const { id_tarifa, tipo_trabajo, valor_hora } = req.body;
  const query =
    "INSERT INTO TARIFA (id_tarifa, tipo_trabajo, valor_hora) VALUES (?, ?, ?)";

  db.query(query, [id_tarifa, tipo_trabajo, valor_hora], (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({ mensaje: "Tarifa configurada con éxito", id: id_tarifa });
  });
});

// Conexión a la base de datos de phpMyAdmin
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Vacío por defecto en XAMPP
  database: "tatuaje", // Nombre exacto de tu script SQL
});

// Comprobar la conexión
db.connect((error) => {
  if (error) {
    console.error(
      "❌ Error al conectar a la base de datos tatuaje:",
      error.message,
    );
    return;
  }
  console.log("✅ ¡Conectado exitosamente a la base de datos: tatuaje!");
});

// ==========================================
//          ENDPOINTS DE CLIENTES
// ==========================================

// 1. Obtener todos los clientes
app.get("/api/clientes", (req, res) => {
  const query = "SELECT * FROM CLIENTE";
  db.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(resultados);
  });
});

// 2. Registrar un nuevo cliente
app.post("/api/clientes", (req, res) => {
  const { id_cliente, nombre, telefono } = req.body;
  const query =
    "INSERT INTO CLIENTE (id_cliente, nombre, telefono) VALUES (?, ?, ?)";

  db.query(query, [id_cliente, nombre, telefono], (err, resultado) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json({
      mensaje: "Cliente registrado con éxito",
      id: id_cliente,
    });
  });
});

// ==========================================
//          ENDPOINTS DE TATUAJES
// ==========================================

// 3. Obtener todos los tatuajes con la información de su cliente (JOIN)
app.get("/api/tatuajes", (req, res) => {
  const query = `
        SELECT t.*, c.nombre AS nombre_cliente
        FROM TATUAJE t
        JOIN CLIENTE c ON t.CLIENTE_id_cliente = c.id_cliente
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
app.post("/api/tatuajes", (req, res) => {
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
  } = req.body;

  // Regla de negocio obligatoria HU-05: El anticipo no puede superar el valor estimado
  if (parseFloat(anticipo) > parseFloat(valor_estimado)) {
    return res.status(400).json({
      error:
        "Alerta: El valor del anticipo no puede superar el valor estimado del tatuaje.",
    });
  }

  const query = `
        INSERT INTO TATUAJE (id_tatuaje, diseno, zona_cuerpo, estado, horas_estimadas, valor_estimado, anticipo, fecha_finalizacion, CLIENTE_id_cliente)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.query(
    query,
    [
      id_tatuaje,
      diseno,
      zona_cuerpo,
      estado,
      horas_estimadas,
      valor_estimado,
      anticipo,
      fecha_finalizacion,
      CLIENTE_id_cliente,
    ],
    (err, resultado) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.json({
        mensaje: "Tatuaje y anticipo registrados con éxito",
        id: id_tatuaje,
      });
    },
  );
});

// ==========================================
//      RESUMEN Y EMISIÓN EN 3FN (HU-06)
// ==========================================

// 1. Obtener sesiones pendientes Y jalar el anticipo de la base de datos
app.get("/api/facturacion/resumen/:tatuaje_id", (req, res) => {
  const tatuajeId = req.params.tatuaje_id;

  // Consulta 1: Traer el anticipo y diseño del tatuaje
  const queryTatuaje =
    "SELECT diseno, anticipo, valor_estimado FROM TATUAJE WHERE id_tatuaje = ?";

  db.query(queryTatuaje, [tatuajeId], (err, datosTatuaje) => {
    if (err) return res.status(500).json({ error: err.message });
    if (datosTatuaje.length === 0)
      return res.status(404).json({ error: "Tatuaje no encontrado." });

    const tatuajeInfo = datosTatuaje[0];

    // Consulta 2: Traer las sesiones que aún no se han metido a ninguna factura
    const querySesiones = `
            SELECT s.id_sesion, s.fecha, s.duracion_horas, s.valor, t.tipo_trabajo
            FROM SESION s
            JOIN TARIFA t ON s.TARIFA_id_tarifa = t.id_tarifa
            WHERE s.TATUAJE_id_tatuaje = ?
            AND s.id_sesion NOT IN (SELECT id_sesion FROM DETALLE_FACTURA)
        `;

    db.query(querySesiones, [tatuajeId], (errS, sesiones) => {
      if (errS) return res.status(500).json({ error: errS.message });

      if (sesiones.length === 0) {
        return res.status(404).json({
          error:
            "Este tatuaje no tiene nuevas sesiones de trabajo pendientes por facturar.",
        });
      }

      const total_calculado = sesiones.reduce(
        (sum, s) => sum + parseFloat(s.valor),
        0,
      );

      // Retornamos todo consolidado al Frontend
      return res.json({
        tatuaje_id: tatuajeId,
        diseno: tatuajeInfo.diseno,
        anticipo_guardado: tatuajeInfo.anticipo, // 👈 Jalado de MySQL
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

    // Calcular la diferencia de días entre la fecha de finalización y el día de hoy
    const fechaFin = new Date(tatuaje.fecha_finalizacion);
    const fechaHoy = new Date();

    // Convertir la diferencia de milisegundos a días
    const diferenciaTiempo = Math.abs(fechaHoy - fechaFin);
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

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
app.post("/api/facturas", (req, res) => {
  const {
    num_factura,
    fecha_emision,
    total,
    TATUAJE_id_tatuaje,
    sesiones_facturar,
  } = req.body;

  // Insertamos primero el encabezado de la Factura
  const queryFactura =
    "INSERT INTO FACTURA (num_factura, fecha_emision, total, TATUAJE_id_tatuaje) VALUES (?, ?, ?, ?)";

  db.query(
    queryFactura,
    [num_factura, fecha_emision, total, TATUAJE_id_tatuaje],
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
              num_factura,
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
          return res.json({
            mensaje:
              "Factura y desglose de detalles guardados con éxito en 3FN.",
            num_factura,
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
});

// ==========================================================================
//          ENDPOINTS DE REPORTES Y COMISIONES (HU-08, HU-09)
// ==========================================================================

// 1. Reporte consolidado por rango de fechas y Tatuadores (HU-09)
app.get("/api/reportes/comisiones", (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query;

  if (!fecha_inicio || !fecha_fin) {
    return res
      .status(400)
      .json({ error: "Por favor proporcione ambas fechas para el filtro." });
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
const PUERTO = 5000;
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PUERTO}`);
});
