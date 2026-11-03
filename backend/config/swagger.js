const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Art Ink Tattoo Studio API",
      version: "2.0.0",
      description:
        "Documentación interactiva de la API de gestión del estudio de tatuajes Art Ink. Arquitectura modular basada en Sequelize (homólogo a EF Core), patrón Repository, Servicios y Controladores.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Servidor local de desarrollo",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
