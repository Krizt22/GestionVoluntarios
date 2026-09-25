const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const router = express.Router();
const pool = require('../config/db');

// Sub-tarea 2.1: Endpoint POST /login
// Sub-tarea 2.2: Cifrado de contraseñas (bcrypt.compare)
// Sub-tarea 2.3: Manejo de sesión/token (JWT)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica de entrada
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    // Buscar usuario por correo, incluyendo el nombre del rol
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.active, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];

    if (!user.active) {
      return res.status(403).json({ message: 'Usuario desactivado' });
    }

    // Sub-tarea 2.2: comparación segura contra el hash guardado

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Sub-tarea 2.3: generar el token JWT

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en /login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
