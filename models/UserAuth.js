const { DataTypes } = require('sequelize');
const sequelize = require('../db/connectionSQL');

const UserAuth = sequelize.define('UserAuth', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = UserAuth;
