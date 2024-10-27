const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./db/connectionSQL');
const connectMongoDB = require('./db/connectionMongoDB');
require('dotenv').config();

const app = express();
const port = 3000;

//Middleware
app.use(cors());

app.use(bodyParser.json());



// Routes
const userProfileRoutes = require('./routes/UserInfo');
app.use('/api/profile', userProfileRoutes);

const chatRoutes = require('./routes/Chat');
app.use('/api/chat', chatRoutes);

const authRoutes = require('./routes/Auth');
app.use('/api/auth', authRoutes);

const init = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente');
    await sequelize.sync();
    console.log('Base de datos SQL sincronizada');

    await connectMongoDB();
  } catch (error) {
    console.error('Error syncing database:', error);
  }
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
};

init();
