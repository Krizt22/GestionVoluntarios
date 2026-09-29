requireAuth();

const API_URL = 'http://localhost:3000/api/campanas';
const form = document.getElementById('campanaForm');
const mensaje = document.getElementById('mensaje');
const tabla = document.getElementById('tablaCampanas');

// Sub-tarea 6.4: crear campaña
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const body = {
    name: document.getElementById('name').value,
    objective: document.getElementById('objective').value,
    description: document.getElementById('description').value,
    start_date: document.getElementById('start_date').value,
    end_date: document.getElementById('end_date').value
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
      cargarCampanas();
    }

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo conectar con el servidor';
    console.error(error);
  }
});

// Sub-tarea 6.5: listar campañas con su estado
async function cargarCampanas() {
  try {
    const response = await fetch(API_URL, { headers: authHeader() });
    const campanas = await response.json();

    tabla.innerHTML = '';
    campanas.forEach((c) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.start_date.split('T')[0]}</td>
        <td>${c.end_date.split('T')[0]}</td>
        <td>${c.status === 'active' ? 'Activa' : 'Finalizada'}</td>
        <td>
          ${c.status === 'active'
            ? `<button onclick="finalizarCampana(${c.id})">Finalizar</button>`
            : '-'}
        </td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar campañas</td></tr>`;
    console.error(error);
  }
}

async function finalizarCampana(id) {
  try {
    const response = await fetch(`${API_URL}/${id}/finalizar`, {
      method: 'PATCH',
      headers: authHeader()
    });
    const data = await response.json();
    alert(data.message);
    cargarCampanas();

  } catch (error) {
    alert('No se pudo conectar con el servidor');
    console.error(error);
  }
}

cargarCampanas();
