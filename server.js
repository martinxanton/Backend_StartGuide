// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const userProfileRoutes = require('./routes/UserProfile');
app.use('/api/user-profile', userProfileRoutes);

// Nueva ruta para el chatbot
const chatRoutes = require('./routes/Chat');
app.use('/api/chat', chatRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
