requireAuth();

async function cargarHistorial() {
  const campania = document.getElementById('filtro-campana').value;
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  const params = new URLSearchParams();
  if (campania) params.append('campaign_id', campania);
  if (desde) params.append('fecha_desde', desde);
  if (hasta) params.append('fecha_hasta', hasta);

  const respuesta = await fetch(`${API_BASE_URL}/api/historial?${params.toString()}`, {
    headers: authHeader()
  });
  const datos = await respuesta.json();

  const tabla = document.getElementById('tabla-historial');
  tabla.innerHTML = '';

  let totalHoras = 0;

  datos.forEach(item => {
    const fila = document.createElement('tr');
    const horas = item.horas ? parseFloat(item.horas) : 0;
    totalHoras += horas;

    fila.innerHTML = `
      <td>${item.fecha}</td>
      <td>${item.campana}</td>
      <td>${item.actividad}</td>
      <td>${item.estado_inscripcion}</td>
      <td>${item.asistencia || '-'}</td>
      <td>${item.horas || '0.00'}</td>
    `;
    tabla.appendChild(fila);
  });

  document.getElementById('total-horas').textContent = totalHoras.toFixed(2);
}

document.getElementById('btn-filtrar').addEventListener('click', cargarHistorial);

cargarHistorial();
