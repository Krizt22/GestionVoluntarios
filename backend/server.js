const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const campaignRoutes = require('./routes/campaigns');
const activityRoutes = require('./routes/activities');
const registrationRoutes = require('./routes/registrations');
const supervisorRoutes = require('./routes/activitySupervisors');
const attendanceRoutes = require('./routes/attendance');
const historialRoutes = require('./routes/historial');
const reportesRoutes = require('./routes/reportes');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de autenticación (incluye POST /api/auth/login)
app.use('/api/auth', authRoutes);

// Rutas de gestión de usuarios (Tarea 3)
app.use('/api/usuarios', userRoutes);

// Rutas de perfil de voluntario (Tarea 5)
app.use('/api/perfil', profileRoutes);

// Rutas de campañas (Tarea 6)
app.use('/api/campanas', campaignRoutes);

// Rutas de actividades (Tarea 7)
app.use('/api/actividades', activityRoutes);

// Rutas de inscripciones (Tarea 8 y 9)
app.use('/api/inscripciones', registrationRoutes);

// Rutas de asignación de supervisores (Tarea 10)
app.use('/api/asignaciones-supervisor', supervisorRoutes);

// Rutas de asistencia (Tarea 12 y 13)
app.use('/api/asistencia', attendanceRoutes);

// Rutas de historial de participación (Tarea 14)
app.use('/api/historial', historialRoutes);

// Rutas de reportes (Tarea 15)
app.use('/api/reportes', reportesRoutes);

app.get('/', (req, res) => {
  res.send('API Gestión de Voluntarios - FDC funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
