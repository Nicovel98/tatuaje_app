const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const db = require("./config/database");
const apiRoutes = require("./routes");
// Inicializar asociaciones de entidades
require("./entities");

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Documentación Swagger / OpenAPI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log("📖 Documentación Swagger UI disponible en http://localhost:5000/api-docs");

// Rutas modulares de la API
app.use("/api", apiRoutes);

// Ruta base de estado
app.get("/", (req, res) => {
  res.json({
    nombre: "Art Ink Tattoo Studio API",
    version: "2.0.0",
    docs: "/api-docs",
  });
});

// Middleware de manejo centralizado de errores
app.use((err, req, res, next) => {
  console.error("Error global:", err);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
  });
});

const PUERTO = process.env.PORT || 5000;

// Probar conexión a la base de datos e iniciar servidor
db.testConnection().then(() => {
  app.listen(PUERTO, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PUERTO}`);
  });
});

module.exports = app;
