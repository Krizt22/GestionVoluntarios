requireAuth();

let reporteActual = null; // 'voluntarios-activos' | 'participacion' | 'horas'

function construirParams() {
  const campania = document.getElementById('filtro-campana').value;
  const desde = document.getElementById('filtro-desde').value;
  const hasta = document.getElementById('filtro-hasta').value;

  const params = new URLSearchParams();
  if (campania) params.append('campaign_id', campania);
  if (desde) params.append('fecha_desde', desde);
  if (hasta) params.append('fecha_hasta', hasta);
  return params;
}

async function cargarReporte(tipo) {
  reporteActual = tipo;
  const params = construirParams();

  const respuesta = await fetch(`${API_BASE_URL}/api/reportes/${tipo}?${params.toString()}`, {
    headers: authHeader()
  });
  const datos = await respuesta.json();

  pintarTabla(datos);
}

function pintarTabla(datos) {
  const encabezado = document.getElementById('encabezado-tabla');
  const cuerpo = document.getElementById('cuerpo-tabla');
  encabezado.innerHTML = '';
  cuerpo.innerHTML = '';

  if (!Array.isArray(datos) || datos.length === 0) {
    cuerpo.innerHTML = '<tr><td>No hay datos para mostrar</td></tr>';
    return;
  }

  const columnas = Object.keys(datos[0]);
  const filaEncabezado = document.createElement('tr');
  columnas.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    filaEncabezado.appendChild(th);
  });
  encabezado.appendChild(filaEncabezado);

  datos.forEach(fila => {
    const tr = document.createElement('tr');
    columnas.forEach(col => {
      const td = document.createElement('td');
      td.textContent = fila[col] ?? '';
      tr.appendChild(td);
    });
    cuerpo.appendChild(tr);
  });
}

// El navegador no manda el token en un <a href> normal, así que descargamos
// el CSV con fetch (incluyendo el header de autorización) y lo convertimos
// en un archivo local para el usuario.
async function descargarCSV() {
  if (!reporteActual) {
    alert('Primero genera un reporte haciendo clic en uno de los botones de arriba');
    return;
  }
  const params = construirParams();
  params.append('formato', 'csv');

  const respuesta = await fetch(`${API_BASE_URL}/api/reportes/${reporteActual}?${params.toString()}`, {
    headers: authHeader()
  });
  const texto = await respuesta.text();

  const blob = new Blob([texto], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${reporteActual}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

document.getElementById('btn-voluntarios').addEventListener('click', () => cargarReporte('voluntarios-activos'));
document.getElementById('btn-participacion').addEventListener('click', () => cargarReporte('participacion'));
document.getElementById('btn-horas').addEventListener('click', () => cargarReporte('horas'));
document.getElementById('link-csv').addEventListener('click', (evento) => {
  evento.preventDefault();
  descargarCSV();
});
