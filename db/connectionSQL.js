const { Sequelize } = require('sequelize');

// Crear la instancia de Sequelize para PostgreSQL
const sequelize = new Sequelize('postgres', 'postgres', 'Martin1614*', {
  host: 'db.pbojqyicmjomazinfnsb.supabase.co',
  port: 5432,
  dialect: 'postgres',
  logging: console.log,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Exportar la instancia de sequelize
module.exports = sequelize;
