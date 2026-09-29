const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

// Todas las rutas de perfil requieren estar logueado (cualquier rol,
// no solo admin, ya que cada quien edita SU PROPIO perfil)
router.use(verificarToken);

// Sub-tarea 5.2: Endpoint GET /perfil (consultar mi propio perfil)
// El id del usuario NO viene en la URL, sino del token (req.usuario.id) —
// así garantizamos que nadie pueda leer el perfil de otra persona.
router.get('/', async (req, res) => {
  try {
    const userId = req.usuario.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, r.name AS role,
              vp.phone, vp.skills, vp.interest_areas, vp.availability
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN volunteer_profiles vp ON vp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error('Error en GET /perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 5.1: Endpoint PUT /perfil (editar mi perfil)
// Usa INSERT ... ON DUPLICATE KEY UPDATE: si el usuario nunca ha llenado
// su perfil, lo crea; si ya existe, lo actualiza. Así el frontend no
// necesita saber si es la primera vez o no.
router.put('/', async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { phone, skills, interest_areas, availability } = req.body;

    await pool.query(
      `INSERT INTO volunteer_profiles (user_id, phone, skills, interest_areas, availability)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         phone = VALUES(phone),
         skills = VALUES(skills),
         interest_areas = VALUES(interest_areas),
         availability = VALUES(availability)`,
      [userId, phone, skills, interest_areas, availability]
    );

    return res.status(200).json({ message: 'Perfil actualizado exitosamente' });

  } catch (error) {
    console.error('Error en PUT /perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
