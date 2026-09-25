const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de autenticación (incluye POST /api/auth/login)
app.use('/api/auth', authRoutes);

// Rutas de gestión de usuarios (Tarea 3)
app.use('/api/usuarios', userRoutes);

app.get('/', (req, res) => {
  res.send('API Gestión de Voluntarios - FDC funcionando correctamente');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
