// Arma la barra de navegación superior según el rol del usuario logueado.
// Cada página solo necesita tener <div id="navbar"></div> al inicio del
// <body> y cargar este script (después de auth-helper.js).

// Enlaces disponibles por rol. "Todos" se agrega siempre al final.
const ENLACES_POR_ROL = {
  admin: [
    { href: 'listado-usuarios.html', texto: 'Usuarios' },
    { href: 'usuarios.html', texto: 'Crear usuario' },
    { href: 'campanas.html', texto: 'Campañas' },
    { href: 'actividades.html', texto: 'Actividades' },
    { href: 'solicitudes.html', texto: 'Solicitudes' },
    { href: 'asignar-supervisor.html', texto: 'Supervisores' },
    { href: 'participantes.html', texto: 'Participantes' },
    { href: 'asistencia.html', texto: 'Asistencia' },
    { href: 'reportes.html', texto: 'Reportes' }
  ],
  coordinator: [
    { href: 'campanas.html', texto: 'Campañas' },
    { href: 'actividades.html', texto: 'Actividades' },
    { href: 'solicitudes.html', texto: 'Solicitudes' },
    { href: 'asignar-supervisor.html', texto: 'Supervisores' },
    { href: 'participantes.html', texto: 'Participantes' },
    { href: 'asistencia.html', texto: 'Asistencia' },
    { href: 'reportes.html', texto: 'Reportes' }
  ],
  supervisor: [
    { href: 'participantes.html', texto: 'Participantes' },
    { href: 'asistencia.html', texto: 'Asistencia' }
  ],
  volunteer: [
    { href: 'actividades-disponibles.html', texto: 'Actividades disponibles' },
    { href: 'mis-inscripciones.html', texto: 'Mis inscripciones' },
    { href: 'historial.html', texto: 'Mi historial' }
  ]
};

// Nombre legible para cada rol, usado en la etiqueta junto al avatar.
const ETIQUETA_ROL = {
  admin: 'Admin',
  coordinator: 'Coordinador',
  supervisor: 'Supervisor',
  volunteer: 'Voluntario'
};

// Como el sistema no maneja fotos de perfil, usamos un avatar con las
// iniciales del nombre del usuario (ej. "Cristian Pineda" -> "CP").
function obtenerIniciales(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/);
  const primera = partes[0]?.charAt(0) || '';
  const segunda = partes.length > 1 ? partes[partes.length - 1].charAt(0) : '';
  return (primera + segunda).toUpperCase();
}

function renderNavbar() {
  const contenedor = document.getElementById('navbar');
  if (!contenedor) return;

  const usuario = typeof getUser === 'function' ? getUser() : null;
  if (!usuario) return; // sin sesión activa, no hay nada que mostrar

  const enlaces = ENLACES_POR_ROL[usuario.role] || [];
  const paginaActual = window.location.pathname.split('/').pop();
  const esDashboard = paginaActual === 'dashboard.html' || paginaActual === '';

  // En el dashboard las opciones ya se muestran como tarjetas abajo, así que
  // en vez de repetirlas en la barra, mostramos un buscador funcional que
  // las filtra. En el resto de páginas se mantiene el menú de enlaces
  // (ya no incluye "Inicio": el logo "FDC" cumple esa función).
  let seccionCentral;
  if (esDashboard) {
    seccionCentral = `
      <div class="navbar-buscador">
        <input type="text" id="nav-buscador" placeholder="Buscar una opción...">
      </div>
    `;
  } else {
    // "Mi perfil" ya no va aquí: el nombre junto al avatar es ahora el
    // botón que lleva al perfil.
    const enlacesHTML = enlaces.map(enlace => {
      const activo = enlace.href === paginaActual ? ' class="nav-activo"' : '';
      return `<a href="${enlace.href}"${activo}>${enlace.texto}</a>`;
    }).join('');
    seccionCentral = `<div class="navbar-enlaces">${enlacesHTML}</div>`;
  }

  contenedor.innerHTML = `
    <div class="navbar">
      <a href="dashboard.html" class="navbar-logo" title="Gestión de Voluntarios · FDC">FDC</a>
      ${seccionCentral}
      <div class="navbar-usuario">
        <a href="perfil.html" class="navbar-perfil" title="Ir a mi perfil">
          <span class="avatar">${obtenerIniciales(usuario.name)}</span>
          <span class="navbar-usuario-nombre">${usuario.name}</span>
          <span class="rol-badge rol-${usuario.role}">${ETIQUETA_ROL[usuario.role] || usuario.role}</span>
        </a>
        <button id="btn-logout" type="button" class="btn-logout">Cerrar sesión</button>
      </div>
    </div>
  `;

  document.getElementById('btn-logout').addEventListener('click', logout);

  if (esDashboard) {
    const buscador = document.getElementById('nav-buscador');
    buscador.addEventListener('input', () => {
      const termino = buscador.value.trim().toLowerCase();
      document.querySelectorAll('.tarjeta').forEach(tarjeta => {
        const coincide = tarjeta.textContent.toLowerCase().includes(termino);
        tarjeta.style.display = coincide ? '' : 'none';
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', renderNavbar);
