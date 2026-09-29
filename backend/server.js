const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const campaignRoutes = require('./routes/campaigns');
const activityRoutes = require('./routes/activities');
const registrationRoutes = require('./routes/registrations');

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

// Rutas de inscripciones (Tarea 8)
app.use('/api/inscripciones', registrationRoutes);

app.get('/', (req, res) => {
  res.send('API Gestión de Voluntarios - FDC funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
