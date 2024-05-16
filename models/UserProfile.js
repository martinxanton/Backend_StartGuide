// models/UserProfile.js
const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const UserProfile = sequelize.define('UserProfile', {
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startupName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  industry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  developmentStage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numberOfEmployees: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mainGoals: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  neededResources: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mainCompetitors: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  strengths: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  challenges: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

sequelize.sync();

module.exports = UserProfile;
