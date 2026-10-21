const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Conexión a la base de datos tatuaje
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'tatuaje'
});

async function registrarAdminSemilla() {
    const id_usuario = 1;
    const nombre = 'Admin Estudio';
    const correo = 'admin@estudio.com';
    const clavePlana = 'admin123';
    const rol = 'ADMINISTRADOR';
    const activo = 'S';

    try {
        // 1. Limpiamos cualquier registro roto previo con ID 1 o con ese correo
        db.query("DELETE FROM USUARIO WHERE id_usuario = ? OR correo = ?", [id_usuario, correo], async (err) => {
            if (err) console.error("Error limpiando tabla:", err);

            // 2. Generamos el hash real usando la librería instalada en tu entorno
            const saltRounds = 10;
            const claveEncriptada = await bcrypt.hash(clavePlana, saltRounds);

            // 3. Insertamos el administrador con el hash exacto
            const query = "INSERT INTO USUARIO (id_usuario, nombre, correo, clave, rol, activo) VALUES (?, ?, ?, ?, ?, ?)";
            
            db.query(query, [id_usuario, nombre, correo, claveEncriptada, rol, activo], (err, resultado) => {
                if (err) {
                    console.error('❌ Error al insertar el usuario:', err.message);
                } else {
                    console.log('==================================================');
                    console.log('✅ ¡Administrador semilla creado con éxito!');
                    console.log(`📧 Correo: ${correo}`);
                    console.log(`🔑 Contraseña: ${clavePlana}`);
                    console.log('==================================================');
                }
                db.end(); // Cerrar la conexión
            });
        });
    } catch (error) {
        console.error('Error procesando el hash:', error);
        db.end();
    }
}

registrarAdminSemilla();