const form = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que la página se recargue

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = 'green';
      mensaje.textContent = `Bienvenido, ${data.user.name} (${data.user.role})`;

      // Guardamos el token y los datos del usuario (nombre y rol) para que
      // el resto del sistema (barra de navegación, dashboard) sepa quién
      // está logueado y qué puede ver, sin tener que pedírselo de nuevo al backend.
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));

      // Redirige al panel principal después de un login exitoso
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } else {
      mensaje.style.color = 'red';
      mensaje.textContent = data.message;
    }

  } catch (error) {
    mensaje.style.color = 'red';
    mensaje.textContent = 'No se pudo conectar con el servidor';
    console.error(error);
  }
});
