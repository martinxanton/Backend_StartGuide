const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    // Reemplaza <db_password> con tu contraseña de MongoDB
    await mongoose.connect(`mongodb+srv://margue:${process.env.passwordMongod}@startbot.ipxjj.mongodb.net/?retryWrites=true&w=majority&appName=startbot`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    throw err;
  }
};

module.exports = connectMongoDB;
