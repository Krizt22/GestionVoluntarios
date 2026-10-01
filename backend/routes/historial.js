const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// Sub-tarea 14.1 y 14.2: GET /historial
// Por defecto muestra el historial del voluntario que hace la consulta.
// admin/coordinator pueden ver el de otro voluntario con ?volunteer_id=
// Filtros opcionales: ?campaign_id= y ?fecha_desde= / ?fecha_hasta= (YYYY-MM-DD)
router.get('/', async (req, res) => {
  try {
    const { campaign_id, fecha_desde, fecha_hasta, volunteer_id } = req.query;
    let targetId = req.usuario.id;

    if (volunteer_id && volunteer_id != req.usuario.id) {
      if (!['admin', 'coordinator'].includes(req.usuario.role)) {
        return res.status(403).json({ message: 'No tienes permiso para ver el historial de otro voluntario' });
      }
      targetId = volunteer_id;
    }

    let query = `
      SELECT
        r.id AS registration_id,
        r.status AS estado_inscripcion,
        a.id AS activity_id,
        a.name AS actividad,
        a.date AS fecha,
        a.start_time,
        a.end_time,
        c.id AS campaign_id,
        c.name AS campana,
        at.status AS asistencia,
        at.check_in,
        at.check_out,
        at.hours_calculated AS horas
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      JOIN campaigns c ON a.campaign_id = c.id
      LEFT JOIN attendance at ON at.registration_id = r.id
      WHERE r.volunteer_id = ?
    `;
    const params = [targetId];

    if (campaign_id) {
      query += ` AND c.id = ?`;
      params.push(campaign_id);
    }
    if (fecha_desde) {
      query += ` AND a.date >= ?`;
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ` AND a.date <= ?`;
      params.push(fecha_hasta);
    }

    query += ` ORDER BY a.date DESC, a.start_time DESC`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /historial:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
