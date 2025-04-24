const { Sequelize } = require('sequelize');
require('dotenv').config();


// Crear la instancia de Sequelize para PostgreSQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  logging: console.log,
});

// Exportar la instancia de sequelize
module.exports = sequelize;
