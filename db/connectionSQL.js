const { Sequelize } = require('sequelize');
require('dotenv').config();


// Crear la instancia de Sequelize para PostgreSQL
const sequelize = new Sequelize('postgres', 'postgres.qpziwblrufqorsumkqqy', 'W1ofKjtS80HqCy1p', {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 6543, // Puerto proporcionado por Supabase
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Cambiar a true en producción
    },
  },
  logging: console.log,
});

// Exportar la instancia de sequelize
module.exports = sequelize;
