requireAuth();

const API_URL = `${API_BASE_URL}/api/perfil`;
const form = document.getElementById('perfilForm');
const mensaje = document.getElementById('mensaje');

// Sub-tarea 5.4: cargar y mostrar el perfil actual
async function cargarPerfil() {
  try {
    const response = await fetch(API_URL, { headers: authHeader() });
    const data = await response.json();

    document.getElementById('vNombre').textContent = data.name;
    document.getElementById('vCorreo').textContent = data.email;
    document.getElementById('vRol').textContent = data.role;

    document.getElementById('phone').value = data.phone || '';
    document.getElementById('skills').value = data.skills || '';
    document.getElementById('interest_areas').value = data.interest_areas || '';
    document.getElementById('availability').value = data.availability || '';

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo cargar el perfil';
    console.error(error);
  }
}

// Sub-tarea 5.3: guardar los cambios del formulario
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const body = {
    phone: document.getElementById('phone').value,
    skills: document.getElementById('skills').value,
    interest_areas: document.getElementById('interest_areas').value,
    availability: document.getElementById('availability').value
  };

  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
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

cargarPerfil();
