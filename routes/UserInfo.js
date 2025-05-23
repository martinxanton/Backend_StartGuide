const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.header("Authorization") || "";
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;  
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token not valid" });
  }
}

// Ruta para verificar la validez del token
router.get('/verify-token', (req, res) => {
  const header = req.header("Authorization") || "";
  const token = header.split(" ")[1];

  if (!token) {
    return res.status(200).json({ valid: false });  // no Token
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ valid: true });  // Token invalid
  } catch (error) {
    return res.status(200).json({ valid: false });  // Token valid
  }
});

// Create a user profile
router.post('/', verifyToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.create(req.body);
    res.status(201).json(userProfile);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.findByPk(req.user.user.id);
    if (userProfile) {
      res.status(200).json(userProfile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check if a user profile exists
router.get('/exists', verifyToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.findByPk(req.user.user.id);
    if (userProfile) {
      res.status(200).json({ valid: true });
    } else {
      res.status(200).json({ valid: false });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a user profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const userProfile = await UserProfile.findByPk(req.user.user.id);
    if (userProfile) {
      await userProfile.update(req.body);
      res.status(200).json(userProfile);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
