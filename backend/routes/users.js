const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Sub-tarea 4.1: todas las rutas de este archivo requieren estar logueado (verificarToken) y ser admin (verificarRol)

router.use(verificarToken, verificarRol('admin'));

// Sub-tarea 3.4: Endpoint GET /usuarios (listar con filtros opcionales)

router.get('/', async (req, res) => {
  try {
    const { role, active } = req.query;

    // Empezamos la consulta con un JOIN fijo (necesitamos el nombre del rol,
    // no solo el role_id) y vamos agregando condiciones solo si el filtro
    // fue enviado, para no forzar al usuario a mandar todos los filtros.
    let query = `
      SELECT u.id, u.name, u.email, r.name AS role, u.active, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE 1 = 1
    `;
    const params = [];

    if (role) {
      query += ` AND r.name = ?`;
      params.push(role);
    }

    if (active !== undefined) {
      // Los query params llegan como texto ("true"/"false"), hay que convertirlos
      query += ` AND u.active = ?`;
      params.push(active === 'true');
    }

    query += ` ORDER BY u.id`;

    const [rows] = await pool.query(query, params);

    return res.status(200).json(rows);

  } catch (error) {
    console.error('Error en GET /usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 3.1: Endpoint POST /usuarios (crear usuario)
// Sub-tarea 3.2: Validación de correo único
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;

    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Cifrado de la contraseña antes de guardarla (mismo principio que en el login)
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id, active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [name, email, passwordHash, role_id]
    );

    return res.status(201).json({
      message: 'Usuario creado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    // Sub-tarea 3.2: MySQL responde con el código ER_DUP_ENTRY cuando
    // se viola una restricción UNIQUE (en este caso, el correo repetido)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    }

    console.error('Error en POST /usuarios:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 3.3: Endpoint PUT /usuarios/:id (editar usuario)

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role_id } = req.body;

    if (!name || !email || !role_id) {
      return res.status(400).json({ message: 'Nombre, correo y rol son obligatorios' });
    }

    const [result] = await pool.query(
      `UPDATE users SET name = ?, email = ?, role_id = ? WHERE id = ?`,
      [name, email, role_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({ message: 'Usuario actualizado exitosamente' });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
    }

    console.error('Error en PUT /usuarios/:id:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 3.3: Endpoint PATCH /usuarios/:id/estado (activar/desactivar)

router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body; // true o false

    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: 'El campo "active" debe ser true o false' });
    }

    const [result] = await pool.query(
      `UPDATE users SET active = ? WHERE id = ?`,
      [active, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      message: active ? 'Usuario activado' : 'Usuario desactivado'
    });

  } catch (error) {
    console.error('Error en PATCH /usuarios/:id/estado:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
