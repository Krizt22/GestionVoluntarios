const form = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // evita que la página se recargue

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
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

      // Guardamos el token para usarlo en futuras solicitudes (sub-tareas siguientes)
      localStorage.setItem('token', data.token);
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
