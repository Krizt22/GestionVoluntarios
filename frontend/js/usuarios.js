const form = document.getElementById('crearUsuarioForm');
const mensaje = document.getElementById('mensaje');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role_id = document.getElementById('role_id').value;

  try {
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password, role_id })
    });

    const data = await response.json();

    if (response.ok) {
      mensaje.style.color = 'green';
      mensaje.textContent = data.message;
      form.reset(); // limpia el formulario tras crear con éxito
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
