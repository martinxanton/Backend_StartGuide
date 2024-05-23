const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// Crear un perfil de usuario
router.post('/', async (req, res) => {
  try {
    const userProfile = await UserProfile.create(req.body);
    res.status(201).json(userProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los perfiles de usuario

router.get('/', async (req, res) => {
try {
    const userProfiles = await UserProfile.findAll();
    res.status(200).json(userProfiles);
} catch (error) {
    res.status(400).json({ error: error.message });
}
});
  
// Obtener un perfil de usuario por ID

router.get('/:id', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
  
// Eliminar un perfil de usuario por ID
router.delete('/:id', async (req, res) => {
try {
    const userProfile = await UserProfile.findByPk(req.params.id);
    if (userProfile) {
    await userProfile.destroy();
    res.status(204).end();
    } else {
    res.status(404).json({ error: 'Perfil no encontrado' });
    }
} catch (error) {
    res.status(400).json({ error: error.message });
}
});
  

module.exports = router;
