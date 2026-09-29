requireAuth();

const API_URL = 'http://localhost:3000/api/actividades';
const form = document.getElementById('actividadForm');
const mensaje = document.getElementById('mensaje');
const tabla = document.getElementById('tablaActividades');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const body = {
    campaign_id: document.getElementById('campaign_id').value,
    name: document.getElementById('name').value,
    location: document.getElementById('location').value,
    date: document.getElementById('date').value,
    max_slots: document.getElementById('max_slots').value
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    mensaje.style.color = response.ok ? 'green' : 'red';
    mensaje.textContent = data.message;

    if (response.ok) {
      form.reset();
      cargarActividades();
    }

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo conectar con el servidor';
    console.error(error);
  }
});

async function cargarActividades() {
  try {
    const response = await fetch(API_URL, { headers: authHeader() });
    const actividades = await response.json();

    tabla.innerHTML = '';
    actividades.forEach((a) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${a.id}</td>
        <td>${a.name}</td>
        <td>${a.campaign_name}</td>
        <td>${a.date.split('T')[0]}</td>
        <td>${a.location || '-'}</td>
        <td>${a.available_slots} / ${a.max_slots}</td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar actividades</td></tr>`;
    console.error(error);
  }
}

cargarActividades();
