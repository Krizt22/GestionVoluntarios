requireAuth();

const API_URL = `${API_BASE_URL}/api/asistencia`;
const mensaje = document.getElementById('mensaje');

async function registrarAsistencia(status) {
  const registration_id = document.getElementById('registration_id').value;

  if (!registration_id) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Ingresa el ID de inscripción';
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ registration_id, status })
    });

    const data = await response.json();
    mensaje.style.color = response.ok ? 'green' : 'red';
    mensaje.textContent = data.message;

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo conectar con el servidor';
    console.error(error);
  }
}

document.getElementById('btnPresente').addEventListener('click', () => registrarAsistencia('present'));
document.getElementById('btnAusente').addEventListener('click', () => registrarAsistencia('absent'));

document.getElementById('btnCheckout').addEventListener('click', async () => {
  const attendanceId = document.getElementById('attendance_id').value;

  if (!attendanceId) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'Ingresa el ID de asistencia';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${attendanceId}/checkout`, {
      method: 'PATCH',
      headers: authHeader()
    });

    const data = await response.json();
    mensaje.style.color = response.ok ? 'green' : 'red';
    mensaje.textContent = response.ok ? `${data.message} (${data.hours} horas)` : data.message;

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo conectar con el servidor';
    console.error(error);
  }
});
