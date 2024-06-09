const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');

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


// Crear un perfil de usuario
router.post('/', verifyToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.create(req.body);
    res.status(201).json(userProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener un perfil de usuario por ID

router.get('/:id', verifyToken, async (req, res) => {
try {
    const userProfile = await UserProfile.findByPk(req.params.id);
    if (userProfile) {
    res.status(200).json(userProfile);
    } else {
    res.status(404).json({ error: 'Perfil no encontrado' });
    }
} catch (error) {
    res.status(400).json({ error: error.message });
}
});

// Actualizar un perfil de usuario por ID
router.put('/:id', verifyToken, async (req, res) => {
try {
    const userProfile = await UserProfile.findByPk(req.params.id);
    if (userProfile) {
    await userProfile.update(req.body);
    res.status(200).json(userProfile);
    } else {
    res.status(404).json({ error: 'Perfil no encontrado' });
    }
} catch (error) {
    res.status(400).json({ error: error.message });
}
});
  

module.exports = router;
