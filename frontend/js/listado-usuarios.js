const tabla = document.getElementById('tablaUsuarios');
const filtroRol = document.getElementById('filtroRol');
const filtroActivo = document.getElementById('filtroActivo');
const btnFiltrar = document.getElementById('btnFiltrar');

const API_URL = 'http://localhost:3000/api/usuarios';

// Sub-tarea 3.7: cargar usuarios aplicando los filtros seleccionados
async function cargarUsuarios() {
  const params = new URLSearchParams();

  if (filtroRol.value) params.append('role', filtroRol.value);
  if (filtroActivo.value) params.append('active', filtroActivo.value);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    const usuarios = await response.json();

    renderizarTabla(usuarios);

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar usuarios</td></tr>`;
    console.error(error);
  }
}

// Dibuja las filas de la tabla a partir del arreglo de usuarios
function renderizarTabla(usuarios) {
  tabla.innerHTML = '';

  usuarios.forEach((usuario) => {
    const fila = document.createElement('tr');

    fila.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.name}</td>
      <td>${usuario.email}</td>
      <td>${usuario.role}</td>
      <td>${usuario.active ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button onclick="editarUsuario(${usuario.id}, '${usuario.name}', '${usuario.email}')">Editar</button>
        <button onclick="cambiarEstado(${usuario.id}, ${usuario.active})">
          ${usuario.active ? 'Desactivar' : 'Activar'}
        </button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

// Sub-tarea 3.6: editar usuario (usamos prompt() para mantenerlo simple)
async function editarUsuario(id, nombreActual, correoActual) {
  const nuevoNombre = prompt('Nuevo nombre:', nombreActual);
  if (nuevoNombre === null) return; // canceló

  const nuevoCorreo = prompt('Nuevo correo:', correoActual);
  if (nuevoCorreo === null) return;

  const nuevoRol = prompt('Nuevo role_id (1=admin, 2=coordinator, 3=supervisor, 4=volunteer):', '');
  if (nuevoRol === null) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nuevoNombre, email: nuevoCorreo, role_id: nuevoRol })
    });

    const data = await response.json();
    alert(data.message);

    cargarUsuarios(); // refresca la tabla con los datos actualizados

  } catch (error) {
    alert('No se pudo conectar con el servidor');
    console.error(error);
  }
}

// Sub-tarea 3.6: activar/desactivar usuario
async function cambiarEstado(id, estadoActual) {
  const nuevoEstado = !estadoActual;

  try {
    const response = await fetch(`${API_URL}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: nuevoEstado })
    });

    const data = await response.json();
    alert(data.message);

    cargarUsuarios(); // refresca la tabla

  } catch (error) {
    alert('No se pudo conectar con el servidor');
    console.error(error);
  }
}

btnFiltrar.addEventListener('click', cargarUsuarios);

// Carga inicial al abrir la página
cargarUsuarios();
