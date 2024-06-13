const { Sequelize } = require('sequelize');
require('dotenv').config();


console.log(process.env.DB_NAME);
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: '65251',
  dialect: 'mssql',
  dialectOptions: {
    options: {
      encrypt: true,
      enableArithAbort: true,
      trustServerCertificate: true, // Útil para problemas con certificados
    },
  },
  logging: console.log 
});

module.exports = sequelize;
