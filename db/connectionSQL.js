const { Sequelize } = require('sequelize');

// Conexión con Sequelize a Neon
const sequelize = new Sequelize('neondb', 'neondb_owner', 'npg_16rzVCQUsvol', {
  host: 'ep-rough-pine-a4rv6p10-pooler.us-east-1.aws.neon.tech',
  port: 5432,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: console.log,
});

module.exports = sequelize;