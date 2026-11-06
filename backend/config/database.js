require("dotenv").config();
const { Sequelize } = require("sequelize");

class Database {
  constructor() {
    if (!Database.instance) {
      const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL;

      const commonOptions = {
        dialect: "mysql",
        logging: process.env.NODE_ENV === "development" ? console.log : false,
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
      };

      if (connectionUri) {
        this.sequelize = new Sequelize(connectionUri, commonOptions);
      } else {
        const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || "tatuaje";
        const dbUser = process.env.MYSQLUSER || process.env.DB_USER || "app_user";
        const dbPassword = process.env.MYSQLPASSWORD !== undefined
          ? process.env.MYSQLPASSWORD
          : (process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "12345");
        const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || "127.0.0.1";
        const dbPort = Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);

        this.sequelize = new Sequelize(dbName, dbUser, dbPassword, {
          host: dbHost,
          port: dbPort,
          ...commonOptions,
        });
      }

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
