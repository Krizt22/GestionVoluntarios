requireAuth();

const API_SUPERVISORES = `${API_BASE_URL}/api/usuarios?role=supervisor`;
const API_ASIGNAR = `${API_BASE_URL}/api/asignaciones-supervisor`;

const select = document.getElementById('supervisor_id');
const form = document.getElementById('asignarForm');
const mensaje = document.getElementById('mensaje');

// Llena el <select> con los usuarios que tienen rol "supervisor"
async function cargarSupervisores() {
  try {
    const response = await fetch(API_SUPERVISORES, { headers: authHeader() });
    const supervisores = await response.json();

    select.innerHTML = '';
    supervisores.forEach((s) => {
      const option = document.createElement('option');
      option.value = s.id;
      option.textContent = `${s.name} (${s.email})`;
      select.appendChild(option);
    });

  } catch (error) {
    console.error('Error al cargar supervisores:', error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const body = {
    activity_id: document.getElementById('activity_id').value,
    supervisor_id: select.value
  };

  try {
    const response = await fetch(API_ASIGNAR, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    mensaje.style.color = response.ok ? 'green' : 'red';
    mensaje.textContent = data.message;

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo conectar con el servidor';
    console.error(error);
  }
});

cargarSupervisores();
