const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserAuth = require('../models/UserAuth'); 

// Ruta para registro de usuario
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log('Parámetros recibidos:', username , password);
  try {
    // Verificar si el usuario ya existe en la base de datos
    let user = await UserAuth.findOne({ where: { username } });

    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Codificar la contraseña
    const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario
    user = await UserAuth.create({
      username,
      password: hashedPassword
    });

    res.status(201).json({ msg: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para login de usuario
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Imprimir en la consola para verificar los parámetros recibidos
  console.log('Parámetros recibidos:', username, password);

  try {
    // Verificar si el usuario existe en la base de datos
    const user = await UserAuth.findOne({ where: { username } });

    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', user.username);


    // Verificar si la contraseña es correcta
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Contraseña incorrecta');
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    console.log('Login exitoso');
    // Crear y devolver token JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
});


function verifyToken(req, res, next) {
  const header = req.header("Authorization") || "";
  const token = header.split(" ")[1];
  console.log("Header:", header);
  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({ message: "Token not provied" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.username = payload.username;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token not valid" });
  }
}

router.get("/protected", verifyToken, (req, res) => {
  return res.status(200).json({ access: true });
});

module.exports = router;
