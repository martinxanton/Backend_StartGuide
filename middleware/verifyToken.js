const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Obtener el token JWT desde los headers

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded; // Agregar el payload decodificado al objeto request para usarlo en las rutas
    next();
  });
};

module.exports = verifyToken;
