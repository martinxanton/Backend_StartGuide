// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
const userProfileRoutes = require('./routes/UserProfile');
app.use('/api/user-profile', userProfileRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
