// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./db/connection');
require('dotenv').config();

const app = express();
const port = 3000;

const init = async () => {
  try {
    // Conexión a la base de datos
    await sequelize
    .authenticate()
    .then(() => {
      console.log('Conexión a la base de datos establecida correctamente');
    })
    .catch(err => {
      console.error('No se pudo conectar a la base de datos:', err);
    });
    await sequelize.sync();
    console.log('Database synced');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
};

// Middleware
app.use(cors());
app.use(bodyParser.json());




// Routes
const userProfileRoutes = require('./routes/UserInfo');
app.use('/api/user-profile', userProfileRoutes);

const chatRoutes = require('./routes/Chat');
app.use('/api/chat', chatRoutes);

const authRoutes = require('./routes/Auth');
app.use('/api/auth', authRoutes);



init();