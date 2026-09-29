const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken);

// Sub-tarea 6.2 (parte consulta): GET /campanas — cualquier usuario logueado puede ver
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT * FROM campaigns WHERE 1 = 1`;
    const params = [];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /campanas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Solo coordinador y admin pueden crear, modificar o finalizar campañas
router.use(verificarRol('admin', 'coordinator'));

// Sub-tarea 6.1: POST /campanas (crear)
// Sub-tarea 6.3: validación de fechas (además del CHECK que ya existe en la BD,
// validamos aquí primero para dar un mensaje de error claro, no un 500 genérico)
router.post('/', async (req, res) => {
  try {
    const { name, objective, description, start_date, end_date } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ message: 'Nombre, fecha de inicio y fecha de fin son obligatorios' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

    const createdBy = req.usuario.id;

    const [result] = await pool.query(
      `INSERT INTO campaigns (name, objective, description, start_date, end_date, status, created_by)
       VALUES (?, ?, ?, ?, ?, 'active', ?)`,
      [name, objective, description, start_date, end_date, createdBy]
    );

    return res.status(201).json({ message: 'Campaña creada exitosamente', campaignId: result.insertId });

  } catch (error) {
    console.error('Error en POST /campanas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 6.2 (parte modificar): PUT /campanas/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, objective, description, start_date, end_date } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ message: 'Nombre, fecha de inicio y fecha de fin son obligatorios' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ message: 'La fecha de fin no puede ser anterior a la fecha de inicio' });
    }

    const [result] = await pool.query(
      `UPDATE campaigns SET name = ?, objective = ?, description = ?, start_date = ?, end_date = ?
       WHERE id = ?`,
      [name, objective, description, start_date, end_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    return res.status(200).json({ message: 'Campaña actualizada exitosamente' });

  } catch (error) {
    console.error('Error en PUT /campanas/:id:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 6.2 (parte finalizar): PATCH /campanas/:id/finalizar
router.patch('/:id/finalizar', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE campaigns SET status = 'finished' WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Campaña no encontrada' });
    }

    return res.status(200).json({ message: 'Campaña finalizada exitosamente' });

  } catch (error) {
    console.error('Error en PATCH /campanas/:id/finalizar:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
