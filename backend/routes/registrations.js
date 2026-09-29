const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken);

// Sub-tarea 8.1: POST /inscripciones (solicitar participación)
// Sub-tarea 8.2: validación de duplicados
// El voluntario NO puede inscribirse dos veces a la misma actividad —
// esto ya está garantizado por la restricción UNIQUE(activity_id, volunteer_id)
// en la base de datos; aquí solo traducimos ese error a un mensaje claro.
router.post('/', async (req, res) => {
  try {
    const { activity_id } = req.body;
    const volunteerId = req.usuario.id;

    if (!activity_id) {
      return res.status(400).json({ message: 'La actividad es obligatoria' });
    }

    const [result] = await pool.query(
      `INSERT INTO registrations (activity_id, volunteer_id, status)
       VALUES (?, ?, 'pending')`,
      [activity_id, volunteerId]
    );

    return res.status(201).json({
      message: 'Solicitud de inscripción enviada, queda pendiente de aprobación',
      registrationId: result.insertId
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya solicitaste participar en esta actividad' });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'La actividad indicada no existe' });
    }
    console.error('Error en POST /inscripciones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 9.3 (adelantada): consultar mis propias inscripciones
router.get('/mias', async (req, res) => {
  try {
    const volunteerId = req.usuario.id;

    const [rows] = await pool.query(
      `SELECT r.id, r.status, r.requested_at, a.name AS activity_name, a.date
       FROM registrations r
       JOIN activities a ON r.activity_id = a.id
       WHERE r.volunteer_id = ?
       ORDER BY r.requested_at DESC`,
      [volunteerId]
    );

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /inscripciones/mias:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;

// Sub-tarea 9.1: PATCH /inscripciones/:id/estado (aprobar/rechazar)
// Sub-tarea 9.2: validación de cupos disponibles al aprobar
// Sub-tarea 9.3: notificación de estado — el voluntario la "recibe" al
// consultar GET /inscripciones/mias, que ya muestra el status actualizado.
router.patch('/:id/estado', verificarRol('admin', 'coordinator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' o 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'El estado debe ser "approved" o "rejected"' });
    }

    // Buscamos la inscripción junto con la actividad para poder validar cupo
    const [regRows] = await pool.query(
      `SELECT r.activity_id, a.max_slots FROM registrations r
       JOIN activities a ON r.activity_id = a.id
       WHERE r.id = ?`,
      [id]
    );

    if (regRows.length === 0) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    if (status === 'approved') {
      const { activity_id, max_slots } = regRows[0];

      const [countRows] = await pool.query(
        `SELECT COUNT(*) AS aprobados FROM registrations
         WHERE activity_id = ? AND status = 'approved'`,
        [activity_id]
      );

      if (countRows[0].aprobados >= max_slots) {
        return res.status(400).json({ message: 'No hay cupos disponibles para esta actividad' });
      }
    }

    await pool.query(`UPDATE registrations SET status = ? WHERE id = ?`, [status, id]);

    return res.status(200).json({
      message: status === 'approved' ? 'Solicitud aprobada' : 'Solicitud rechazada'
    });

  } catch (error) {
    console.error('Error en PATCH /inscripciones/:id/estado:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 9.4: GET /inscripciones (panel de coordinador — ver todas las solicitudes)
router.get('/', verificarRol('admin', 'coordinator'), async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT r.id, r.status, r.requested_at,
             a.name AS activity_name, u.name AS volunteer_name, u.email AS volunteer_email
      FROM registrations r
      JOIN activities a ON r.activity_id = a.id
      JOIN users u ON r.volunteer_id = u.id
      WHERE 1 = 1
    `;
    const params = [];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY r.requested_at DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /inscripciones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});
