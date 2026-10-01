requireAuth();

const tabla = document.getElementById('tablaParticipantes');
const input = document.getElementById('activity_id');
const btnBuscar = document.getElementById('btnBuscar');

async function cargarParticipantes() {
  const activityId = input.value;
  if (!activityId) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/actividades/${activityId}/participantes`,
      { headers: authHeader() }
    );
    const participantes = await response.json();

    tabla.innerHTML = '';
    if (!response.ok) {
      tabla.innerHTML = `<tr><td colspan="2">${participantes.message}</td></tr>`;
      return;
    }

    participantes.forEach((p) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `<td>${p.name}</td><td>${p.email}</td>`;
      tabla.appendChild(fila);
    });

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="2">Error al cargar participantes</td></tr>`;
    console.error(error);
  }
}

btnBuscar.addEventListener('click', cargarParticipantes);
