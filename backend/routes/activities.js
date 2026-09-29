const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken);

// Sub-tarea 7.3: GET /actividades (listar actividades disponibles)
// "Disponibles" = pertenecen a una campaña activa y todavía tienen cupo libre.
// Cualquier usuario logueado puede consultarlas (incluye voluntarios).
router.get('/', async (req, res) => {
  try {
    const { campaign_id } = req.query;

    let query = `
      SELECT a.*, c.name AS campaign_name,
             a.max_slots - COALESCE(
               (SELECT COUNT(*) FROM registrations r
                WHERE r.activity_id = a.id AND r.status = 'approved'), 0
             ) AS available_slots
      FROM activities a
      JOIN campaigns c ON a.campaign_id = c.id
      WHERE c.status = 'active'
    `;
    const params = [];

    if (campaign_id) {
      query += ` AND a.campaign_id = ?`;
      params.push(campaign_id);
    }

    query += ` ORDER BY a.date`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /actividades:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Solo coordinador y admin pueden crear actividades
router.use(verificarRol('admin', 'coordinator'));

// Sub-tarea 7.1: POST /actividades (crear)
// Sub-tarea 7.2: validación de cupo máximo (número positivo)
router.post('/', async (req, res) => {
  try {
    const { campaign_id, name, description, location, date, start_time, end_time, max_slots } = req.body;

    if (!campaign_id || !name || !date || !max_slots) {
      return res.status(400).json({ message: 'Campaña, nombre, fecha y cupo máximo son obligatorios' });
    }

    if (Number(max_slots) <= 0) {
      return res.status(400).json({ message: 'El cupo máximo debe ser un número mayor a 0' });
    }

    const [result] = await pool.query(
      `INSERT INTO activities (campaign_id, name, description, location, date, start_time, end_time, max_slots)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [campaign_id, name, description, location, date, start_time || null, end_time || null, max_slots]
    );

    return res.status(201).json({ message: 'Actividad creada exitosamente', activityId: result.insertId });

  } catch (error) {
    // Si el campaign_id no existe, la FK lo rechaza con este código
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'La campaña indicada no existe' });
    }
    console.error('Error en POST /actividades:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
