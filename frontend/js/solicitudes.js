requireAuth();

const API_URL = 'http://localhost:3000/api/inscripciones';
const tabla = document.getElementById('tablaSolicitudes');

// Sub-tarea 9.4: panel de coordinador
async function cargarSolicitudes() {
  try {
    const response = await fetch(API_URL, { headers: authHeader() });
    const solicitudes = await response.json();

    tabla.innerHTML = '';
    solicitudes.forEach((s) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${s.id}</td>
        <td>${s.volunteer_name}</td>
        <td>${s.activity_name}</td>
        <td>${s.status}</td>
        <td>
          ${s.status === 'pending'
            ? `<button onclick="cambiarEstado(${s.id}, 'approved')">Aprobar</button>
               <button onclick="cambiarEstado(${s.id}, 'rejected')">Rechazar</button>`
            : '-'}
        </td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="5">Error al cargar solicitudes</td></tr>`;
    console.error(error);
  }
}

async function cambiarEstado(id, status) {
  try {
    const response = await fetch(`${API_URL}/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    alert(data.message);
    cargarSolicitudes();

  } catch (error) {
    alert('No se pudo conectar con el servidor');
    console.error(error);
  }
}

cargarSolicitudes();
