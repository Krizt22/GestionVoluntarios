requireAuth();

const API_ACTIVIDADES = 'http://localhost:3000/api/actividades';
const API_INSCRIPCIONES = 'http://localhost:3000/api/inscripciones';
const tabla = document.getElementById('tablaActividades');

async function cargarActividades() {
  try {
    const response = await fetch(API_ACTIVIDADES, { headers: authHeader() });
    const actividades = await response.json();

    tabla.innerHTML = '';
    actividades.forEach((a) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${a.id}</td>
        <td>${a.name}</td>
        <td>${a.campaign_name}</td>
        <td>${a.date.split('T')[0]}</td>
        <td>${a.available_slots} / ${a.max_slots}</td>
        <td><button onclick="solicitarParticipacion(${a.id})">Solicitar</button></td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar actividades</td></tr>`;
    console.error(error);
  }
}

// Sub-tarea 8.3: solicitar participación en una actividad
async function solicitarParticipacion(activityId) {
  try {
    const response = await fetch(API_INSCRIPCIONES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ activity_id: activityId })
    });

    const data = await response.json();
    alert(data.message);

  } catch (error) {
    alert('No se pudo conectar con el servidor');
    console.error(error);
  }
}

cargarActividades();
