const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================================
//          ENDPOINTS DE USUARIOS & LOGIN (HU-10, HU-11)
// ==========================================

// 1. Iniciar Sesión con Verificación de Bcrypt (HU-10)
app.post('/api/login', (req, res) => {
    const { correo, clave } = req.body;
    
    // Buscamos el usuario únicamente por su correo
    const query = "SELECT id_usuario, nombre, correo, clave, rol, activo FROM USUARIO WHERE correo = ?";

    db.query(query, [correo], async (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Si no encuentra el correo
        if (resultados.length === 0) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        const usuario = resultados[0];

        // Validamos si el usuario está activo antes de verificar la clave
        if (usuario.activo === 'N') {
            return res.status(403).json({ error: 'El usuario está inactivo' });
        }

        try {
            // Comparamos la contraseña en texto plano con el hash de la base de datos
            const coincide = await bcrypt.compare(clave, usuario.clave);
            
            if (!coincide) {
                return res.status(401).json({ error: 'Credenciales incorrectas' });
            }

            // Si coincide, respondemos con los datos del usuario (quitando la clave por seguridad)
            return res.json({
                mensaje: 'Inicio de sesión exitoso',
                usuario: {
                    id_usuario: usuario.id_usuario,
                    nombre: usuario.nombre,
                    correo: usuario.correo,
                    rol: usuario.rol
                }
            });

        } catch (error) {
            return res.status(500).json({ error: 'Error al verificar las credenciales' });
        }
    });
});

// 2. Registrar un nuevo Tatuador/Usuario con encriptación (HU-11)
app.post('/api/usuarios', (req, res) => {
    const { id_usuario, nombre, correo, clave, rol } = req.body;
    const activo = 'S'; 

    // 1. Validamos si el correo ya existe
    const checkQuery = "SELECT * FROM USUARIO WHERE correo = ?";
    db.query(checkQuery, [correo], async (err, fila) => {
        if (err) return res.status(500).json({ error: err.message });
        if (fila.length > 0) {
            return res.status(400).json({ error: 'El correo ya está en uso' });
        }

        try {
            // 2. Encriptamos la contraseña (10 rondas de salting son el estándar)
            const saltRounds = 10;
            const claveEncriptada = await bcrypt.hash(clave, saltRounds);

            // 3. Insertamos el registro con la clave protegida
            const query = "INSERT INTO USUARIO (id_usuario, nombre, correo, clave, rol, activo) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(query, [id_usuario, nombre, correo, claveEncriptada, rol, activo], (err, resultado) => {
                if (err) return res.status(500).json({ error: err.message });
                return res.json({ mensaje: 'Colaborador registrado con éxito', id: id_usuario });
            });

        } catch (error) {
            return res.status(500).json({ error: 'Error al procesar la seguridad de la contraseña' });
        }
    });
});

// Obtener la lista de usuarios/tatuadores activos
app.get('/api/usuarios', (req, res) => {
    const query = "SELECT id_usuario, nombre, correo, rol, activo FROM USUARIO WHERE activo = 'S'";
    db.query(query, (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(resultados);
    });
});

// ==========================================
//          ENDPOINTS DE SESIONES (HU-02, HU-03)
// ==========================================

// 1. Registrar una nueva sesión de trabajo (HU-02)
app.post('/api/sesiones', (req, res) => {
    const { 
        id_sesion, 
        fecha, 
        duracion_horas, 
        es_retoque, 
        valor, 
        TATUAJE_id_tatuaje, 
        USUARIO_id_usuario, 
        TARIFA_id_tarifa 
    } = req.body;

    // Validación de negocio (Regla de calidad: Duración mayor a cero)
    if (parseFloat(duracion_horas) <= 0) {
        return res.status(400).json({ error: 'La duración de la sesión debe ser mayor a cero horas.' });
    }

    const query = `
        INSERT INTO SESION (id_sesion, fecha, duracion_horas, es_retoque, valor, TATUAJE_id_tatuaje, USUARIO_id_usuario, TARIFA_id_tarifa) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query, 
        [id_sesion, fecha, duracion_horas, es_retoque, valor, TATUAJE_id_tatuaje, USUARIO_id_usuario, TARIFA_id_tarifa], 
        (err, resultado) => {
            if (err) return res.status(500).json({ error: err.message });
            return res.json({ mensaje: 'Sesión de trabajo registrada con éxito', id: id_sesion });
        }
    );
});

// 2. Obtener el historial de sesiones agrupadas o filtradas por tatuaje (HU-03)
app.get('/api/sesiones/tatuaje/:id', (req, res) => {
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
app.get('/api/tarifas', (req, res) => {
    const query = "SELECT * FROM TARIFA";
    db.query(query, (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(resultados);
    });
});

// 2. Crear una nueva tarifa base
app.post('/api/tarifas', (req, res) => {
    const { id_tarifa, tipo_trabajo, valor_hora } = req.body;
    const query = "INSERT INTO TARIFA (id_tarifa, tipo_trabajo, valor_hora) VALUES (?, ?, ?)";

    db.query(query, [id_tarifa, tipo_trabajo, valor_hora], (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ mensaje: 'Tarifa configurada con éxito', id: id_tarifa });
    });
});

// Conexión a la base de datos de phpMyAdmin
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Vacío por defecto en XAMPP
    database: 'tatuaje' // Nombre exacto de tu script SQL
});

// Comprobar la conexión
db.connect((error) => {
    if (error) {
        console.error('❌ Error al conectar a la base de datos tatuaje:', error.message);
        return;
    }
    console.log('✅ ¡Conectado exitosamente a la base de datos: tatuaje!');
});

// ==========================================
//          ENDPOINTS DE CLIENTES
// ==========================================

// 1. Obtener todos los clientes
app.get('/api/clientes', (req, res) => {
    const query = "SELECT * FROM CLIENTE";
    db.query(query, (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json(resultados);
    });
});

// 2. Registrar un nuevo cliente
app.post('/api/clientes', (req, res) => {
    const { id_cliente, nombre, telefono } = req.body;
    const query = "INSERT INTO CLIENTE (id_cliente, nombre, telefono) VALUES (?, ?, ?)";
    
    db.query(query, [id_cliente, nombre, telefono], (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ mensaje: 'Cliente registrado con éxito', id: id_cliente });
    });
});

// ==========================================
//          ENDPOINTS DE TATUAJES
// ==========================================

// 3. Obtener todos los tatuajes con la información de su cliente (JOIN)
app.get('/api/tatuajes', (req, res) => {
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
app.post('/api/tatuajes', (req, res) => {
    const { id_tatuaje, diseno, zona_cuerpo, estado, valor_estimado, fecha_finalizacion, CLIENTE_id_cliente } = req.body;
    const query = `
        INSERT INTO TATUAJE (id_tatuaje, diseno, zona_cuerpo, estado, valor_estimado, fecha_finalizacion, CLIENTE_id_cliente)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [id_tatuaje, diseno, zona_cuerpo, estado, valor_estimado, fecha_finalizacion, CLIENTE_id_cliente], (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ mensaje: 'Tatuaje registrado con éxito', id: id_tatuaje });
    });
});

// ==========================================
//        ENDPOINTS DE FACTURACIÓN (HU-05, HU-06)
// ==========================================

// 1. Obtener la información consolidada para facturar un tatuaje (HU-06)
// Suma las sesiones vinculadas al tatuaje para dar el valor antes de procesar la factura
app.get('/api/facturacion/resumen/:tatuaje_id', (req, res) => {
    const tatuajeId = req.params.tatuaje_id;

    // Consulta para sumar la duración de horas y valores de todas las sesiones de un tatuaje
    const querySesiones = `
        SELECT COUNT(*) AS total_sesiones, SUM(valor) AS subtotal_sesiones 
        FROM SESION 
        WHERE TATUAJE_id_tatuaje = ?
    `;

    db.query(querySesiones, [tatuajeId], (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const datos = resultados[0];
        if (datos.total_sesiones === 0) {
            return res.status(440).json({ error: 'El tatuaje no tiene ninguna sesión registrada para facturar.' });
        }

        return res.json({
            tatuaje_id: tatuajeId,
            total_sesiones: datos.total_sesiones,
            total_calculado: datos.subtotal_sesiones || 0
        });
    });
});

// 2. Guardar la factura definitiva en la base de datos
app.post('/api/facturas', (req, res) => {
    const { num_factura, fecha_emision, total, TATUAJE_id_tatuaje } = req.body;

    const query = "INSERT INTO FACTURA (num_factura, fecha_emision, total, TATUAJE_id_tatuaje) VALUES (?, ?, ?, ?)";
    db.query(query, [num_factura, fecha_emision, total, TATUAJE_id_tatuaje], (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ mensaje: 'Factura generada exitosamente en el sistema.', num_factura });
    });
});


// Iniciar servidor
const PUERTO = 5000;
app.listen(PUERTO, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PUERTO}`);
});