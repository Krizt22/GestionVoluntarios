const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica que la solicitud traiga un token JWT válido.
// Se usa en cualquier ruta que requiera estar logueado.
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1]; // formato: "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // queda disponible en las siguientes rutas
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

// Verifica que el usuario logueado tenga uno de los roles permitidos.

function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.role)) {
      return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    }
    next();
  };
}

module.exports = { verificarToken, verificarRol };
