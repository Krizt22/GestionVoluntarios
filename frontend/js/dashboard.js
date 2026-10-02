requireAuth();

// Breves descripciones por página, para que las tarjetas del dashboard
// digan algo más que solo el nombre del enlace.
const DESCRIPCIONES = {
  'listado-usuarios.html': 'Ver, filtrar, editar y activar/desactivar usuarios del sistema.',
  'usuarios.html': 'Crear una nueva cuenta de usuario y asignarle un rol.',
  'campanas.html': 'Crear campañas y gestionar su estado (activa / finalizada).',
  'actividades.html': 'Crear actividades dentro de una campaña y definir sus cupos.',
  'solicitudes.html': 'Aprobar o rechazar las solicitudes de inscripción de los voluntarios.',
  'asignar-supervisor.html': 'Asignar un supervisor responsable a cada actividad.',
  'participantes.html': 'Consultar los voluntarios aprobados de una actividad.',
  'asistencia.html': 'Registrar la entrada y salida de los voluntarios en campo.',
  'reportes.html': 'Generar reportes de voluntarios activos, participación y horas.',
  'actividades-disponibles.html': 'Ver las actividades disponibles y solicitar participar.',
  'mis-inscripciones.html': 'Ver el estado de tus solicitudes de inscripción.',
  'historial.html': 'Consultar tu historial de participación y horas acumuladas.',
  'perfil.html': 'Ver y editar tu información de perfil.'
};

function cargarDashboard() {
  const usuario = getUser();
  if (!usuario) return;

  document.getElementById('saludo').textContent = `Bienvenido, ${usuario.name}`;

  const enlacesRol = ENLACES_POR_ROL[usuario.role] || [];
  const enlaces = [...enlacesRol, { href: 'perfil.html', texto: 'Mi perfil' }];

  const contenedor = document.getElementById('tarjetas');
  contenedor.innerHTML = enlaces.map(enlace => `
    <a class="tarjeta" href="${enlace.href}">
      <h2>${enlace.texto}</h2>
      <p>${DESCRIPCIONES[enlace.href] || ''}</p>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', cargarDashboard);
