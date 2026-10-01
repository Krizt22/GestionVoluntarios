const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken, verificarRol('admin', 'coordinator'));

// Sub-tarea 10.1: POST /asignaciones-supervisor (asignar supervisor a actividad)
// Sub-tarea 10.2: validación de rol — solo un usuario con rol "supervisor"
// puede ser asignado (no un voluntario, coordinador, etc.)
router.post('/', async (req, res) => {
  try {
    const { activity_id, supervisor_id } = req.body;

    if (!activity_id || !supervisor_id) {
      return res.status(400).json({ message: 'Actividad y supervisor son obligatorios' });
    }

    // Verificamos que el usuario indicado realmente tenga rol "supervisor"
    const [rows] = await pool.query(
      `SELECT u.id FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND r.name = 'supervisor'`,
      [supervisor_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'El usuario indicado no tiene rol de supervisor' });
    }

    const [result] = await pool.query(
      `INSERT INTO activity_supervisors (activity_id, supervisor_id) VALUES (?, ?)`,
      [activity_id, supervisor_id]
    );

    return res.status(201).json({ message: 'Supervisor asignado exitosamente', id: result.insertId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este supervisor ya está asignado a esta actividad' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'La actividad indicada no existe' });
    }
    console.error('Error en POST /asignaciones-supervisor:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Listar supervisores asignados a una actividad (útil para el frontend)
router.get('/', async (req, res) => {
  try {
    const { activity_id } = req.query;

    const [rows] = await pool.query(
      `SELECT asup.id, u.name, u.email, asup.activity_id
       FROM activity_supervisors asup
       JOIN users u ON asup.supervisor_id = u.id
       WHERE asup.activity_id = ?`,
      [activity_id]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /asignaciones-supervisor:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
