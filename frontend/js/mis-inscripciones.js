requireAuth();

const API_URL = 'http://localhost:3000/api/inscripciones/mias';
const tabla = document.getElementById('tablaMisInscripciones');

async function cargarMisInscripciones() {
  try {
    const response = await fetch(API_URL, { headers: authHeader() });
    const inscripciones = await response.json();

    tabla.innerHTML = '';
    inscripciones.forEach((i) => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${i.activity_name}</td>
        <td>${i.date.split('T')[0]}</td>
        <td>${i.status}</td>
      `;
      tabla.appendChild(fila);
    });

  } catch (error) {
    tabla.innerHTML = `<tr><td colspan="3">Error al cargar tus inscripciones</td></tr>`;
    console.error(error);
  }
}

cargarMisInscripciones();
