const { Sequelize } = require("sequelize");

class Database {
  constructor() {
    if (!Database.instance) {
      this.sequelize = new Sequelize("tatuaje", "app_user", "12345", {
        host: "127.0.0.1",
        dialect: "mysql",
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          paranoid: false, // Usaremos el campo 'eliminado' para control explícito de soft-delete
          createdAt: "fecha_creacion",
          updatedAt: "fecha_actualizacion",
        },
      });

      Database.instance = this;
    }
    return Database.instance;
  }

  getSequelize() {
    return this.sequelize;
  }

  async testConnection() {
    try {
      await this.sequelize.authenticate();
      console.log("✅ Conexión Singleton a MySQL (Sequelize / DbContext) establecida exitosamente.");
    } catch (error) {
      console.error("❌ Error conectando a la base de datos:", error.message);
    }
  }
}

const dbInstance = new Database();
Object.freeze(dbInstance);

module.exports = dbInstance;
