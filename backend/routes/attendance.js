const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken, verificarRol('admin', 'coordinator', 'supervisor'));

// Sub-tarea 12.1: POST /asistencia (registrar check-in, o marcar ausente)
// Sub-tarea 12.2: validación de no aprobados — no se puede registrar
// asistencia de un voluntario cuya inscripción no esté "approved"
router.post('/', async (req, res) => {
  try {
    const { registration_id, status } = req.body; // status: 'present' o 'absent'

    if (!registration_id || !status) {
      return res.status(400).json({ message: 'La inscripción y el estado son obligatorios' });
    }

    if (!['present', 'absent'].includes(status)) {
      return res.status(400).json({ message: 'El estado debe ser "present" o "absent"' });
    }

    // Sub-tarea 12.2: verificamos que la inscripción exista y esté aprobada
    const [regRows] = await pool.query(
      `SELECT status FROM registrations WHERE id = ?`,
      [registration_id]
    );

    if (regRows.length === 0) {
      return res.status(404).json({ message: 'Inscripción no encontrada' });
    }

    if (regRows[0].status !== 'approved') {
      return res.status(400).json({ message: 'No se puede registrar asistencia de una inscripción no aprobada' });
    }

    const checkIn = status === 'present' ? new Date() : null;

    const [result] = await pool.query(
      `INSERT INTO attendance (registration_id, status, check_in)
       VALUES (?, ?, ?)`,
      [registration_id, status, checkIn]
    );

    return res.status(201).json({ message: 'Asistencia registrada', attendanceId: result.insertId });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya se registró asistencia para esta inscripción' });
    }
    console.error('Error en POST /asistencia:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Registrar la hora de salida (check-out) y calcular las horas —
// se separa del POST porque check-in y check-out ocurren en momentos distintos
router.patch('/:id/checkout', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`SELECT check_in FROM attendance WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Registro de asistencia no encontrado' });
    }

    if (!rows[0].check_in) {
      return res.status(400).json({ message: 'No se puede registrar salida sin una entrada previa' });
    }

    const checkOut = new Date();
    const horas = (checkOut - new Date(rows[0].check_in)) / (1000 * 60 * 60);

    await pool.query(
      `UPDATE attendance SET check_out = ?, hours_calculated = ? WHERE id = ?`,
      [checkOut, horas.toFixed(2), id]
    );

    return res.status(200).json({ message: 'Salida registrada', hours: horas.toFixed(2) });

  } catch (error) {
    console.error('Error en PATCH /asistencia/:id/checkout:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 13.3: GET /asistencia/total (horas acumuladas)
// Sin parámetro -> mis propias horas. Con ?volunteer_id= -> las de otro
// voluntario (solo admin/coordinator pueden consultar las de alguien más).
router.get('/total', async (req, res) => {
  try {
    const { volunteer_id } = req.query;
    let targetId = req.usuario.id;

    if (volunteer_id && volunteer_id != req.usuario.id) {
      if (!['admin', 'coordinator'].includes(req.usuario.role)) {
        return res.status(403).json({ message: 'No tienes permiso para ver las horas de otro voluntario' });
      }
      targetId = volunteer_id;
    }

    // Sub-tarea 13.2: los ausentes nunca tienen hours_calculated (quedan NULL),
    // así que SUM() ya los excluye automáticamente sin necesitar un filtro extra.
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(at.hours_calculated), 0) AS total_horas
       FROM attendance at
       JOIN registrations r ON at.registration_id = r.id
       WHERE r.volunteer_id = ?`,
      [targetId]
    );

    return res.status(200).json({ volunteer_id: targetId, total_horas: rows[0].total_horas });

  } catch (error) {
    console.error('Error en GET /asistencia/total:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
