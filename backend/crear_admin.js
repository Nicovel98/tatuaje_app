const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Conexión a la base de datos tatuaje
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "app_user",
  password: "12345",
  database: "tatuaje",
});

async function registrarSemillas() {
  try {
    const saltRounds = 10;
    const adminClave = await bcrypt.hash("admin123", saltRounds);
    const tatuadorClave = await bcrypt.hash("tatuador123", saltRounds);

    db.query("DELETE FROM USUARIO WHERE id_usuario IN (1, 2) OR correo IN ('admin@estudio.com', 'carlos@estudio.com')", (err) => {
      if (err) console.error("Error limpiando:", err);

      const query = `
        INSERT INTO USUARIO (id_usuario, nombre, correo, clave, rol, estado, eliminado, usuario_creacion)
        VALUES 
          (1, 'Admin Estudio', 'admin@estudio.com', ?, 'ADMINISTRADOR', 'ACTIVO', FALSE, 'SISTEMA'),
          (2, 'Carlos Tatuador', 'carlos@estudio.com', ?, 'TATUADOR', 'ACTIVO', FALSE, 'SISTEMA')
      `;

      db.query(query, [adminClave, tatuadorClave], (err, res) => {
        if (err) {
          console.error("❌ Error al insertar usuarios semilla:", err.message);
        } else {
          console.log("==================================================");
          console.log("✅ Usuarios semilla creados con éxito:");
          console.log("📧 admin@estudio.com / admin123 (ADMINISTRADOR)");
          console.log("📧 carlos@estudio.com / tatuador123 (TATUADOR)");
          console.log("==================================================");
        }
        db.end();
      });
    });
  } catch (error) {
    console.error("Error:", error);
    db.end();
  }
}

registrarSemillas();
