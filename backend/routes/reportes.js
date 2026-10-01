const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');

router.use(verificarToken, verificarRol('admin', 'coordinator'));

// Convierte un arreglo de objetos a texto CSV simple (separado por comas,
// comillas dobles para escapar valores que contengan comas o comillas)
function aCSV(filas) {
  if (filas.length === 0) return '';
  const columnas = Object.keys(filas[0]);
  const escapar = (valor) => {
    if (valor === null || valor === undefined) return '';
    const texto = String(valor);
    if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
  };
  const encabezado = columnas.join(',');
  const lineas = filas.map(fila => columnas.map(col => escapar(fila[col])).join(','));
  return [encabezado, ...lineas].join('\n');
}

// Envía la respuesta en JSON o CSV según ?formato=csv
function responder(req, res, filas, nombreArchivo) {
  if (req.query.formato === 'csv') {
    const csv = aCSV(filas);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.csv"`);
    return res.status(200).send(csv);
  }
  return res.status(200).json(filas);
}

// Sub-tarea 15.1: Reporte de voluntarios activos
router.get('/voluntarios-activos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name AS nombre, u.email, vp.phone AS telefono,
              vp.skills AS habilidades, vp.availability AS disponibilidad
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN volunteer_profiles vp ON vp.user_id = u.id
       WHERE r.name = 'volunteer' AND u.active = TRUE
       ORDER BY u.name`
    );
    return responder(req, res, rows, 'voluntarios_activos');
  } catch (error) {
    console.error('Error en GET /reportes/voluntarios-activos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 15.2: Reporte de participación y asistencia por actividad
// Filtros opcionales: ?campaign_id= y ?fecha_desde= / ?fecha_hasta=
router.get('/participacion', async (req, res) => {
  try {
    const { campaign_id, fecha_desde, fecha_hasta } = req.query;

    let query = `
      SELECT
        a.id AS activity_id,
        a.name AS actividad,
        c.name AS campana,
        a.date AS fecha,
        a.max_slots AS cupo_maximo,
        COUNT(DISTINCT CASE WHEN r.status = 'approved' THEN r.id END) AS aprobados,
        COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) AS pendientes,
        COUNT(DISTINCT CASE WHEN r.status = 'rejected' THEN r.id END) AS rechazados,
        COUNT(DISTINCT CASE WHEN at.status = 'present' THEN at.id END) AS asistieron,
        COUNT(DISTINCT CASE WHEN at.status = 'absent' THEN at.id END) AS ausentes
      FROM activities a
      JOIN campaigns c ON a.campaign_id = c.id
      LEFT JOIN registrations r ON r.activity_id = a.id
      LEFT JOIN attendance at ON at.registration_id = r.id
      WHERE 1 = 1
    `;
    const params = [];

    if (campaign_id) {
      query += ' AND c.id = ?';
      params.push(campaign_id);
    }
    if (fecha_desde) {
      query += ' AND a.date >= ?';
      params.push(fecha_desde);
    }
    if (fecha_hasta) {
      query += ' AND a.date <= ?';
      params.push(fecha_hasta);
    }

    query += ' GROUP BY a.id ORDER BY a.date DESC';

    const [rows] = await pool.query(query, params);
    return responder(req, res, rows, 'reporte_participacion');
  } catch (error) {
    console.error('Error en GET /reportes/participacion:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sub-tarea 15.3: Reporte de horas acumuladas por voluntario
// Filtros opcionales: ?campaign_id= y ?fecha_desde= / ?fecha_hasta=
router.get('/horas', async (req, res) => {
  try {
    const { campaign_id, fecha_desde, fecha_hasta } = req.query;

    // Los filtros de fecha/campaña van en la condición del JOIN (no en el
    // WHERE) para que un voluntario sin ninguna actividad dentro del rango
    // filtrado siga apareciendo en el reporte con 0.00 horas, en vez de
    // desaparecer por completo (eso pasaba antes porque el WHERE convertía
    // el LEFT JOIN en un INNER JOIN de facto).
    let joinActividades = 'LEFT JOIN activities act ON reg.activity_id = act.id';
    const paramsActividades = [];
    if (fecha_desde) {
      joinActividades += ' AND act.date >= ?';
      paramsActividades.push(fecha_desde);
    }
    if (fecha_hasta) {
      joinActividades += ' AND act.date <= ?';
      paramsActividades.push(fecha_hasta);
    }

    let joinCampanas = 'LEFT JOIN campaigns camp ON act.campaign_id = camp.id';
    const paramsCampanas = [];
    if (campaign_id) {
      joinCampanas += ' AND camp.id = ?';
      paramsCampanas.push(campaign_id);
    }

    const query = `
      SELECT
        u.id AS volunteer_id,
        u.name AS nombre,
        u.email,
        COALESCE(SUM(at.hours_calculated), 0) AS total_horas
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN registrations reg ON reg.volunteer_id = u.id
      ${joinActividades}
      ${joinCampanas}
      LEFT JOIN attendance at ON at.registration_id = reg.id
      WHERE r.name = 'volunteer'
      GROUP BY u.id
      ORDER BY total_horas DESC
    `;

    const params = [...paramsActividades, ...paramsCampanas];

    const [rows] = await pool.query(query, params);
    return responder(req, res, rows, 'reporte_horas');
  } catch (error) {
    console.error('Error en GET /reportes/horas:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
