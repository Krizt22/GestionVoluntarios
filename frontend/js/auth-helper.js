// Redirige al login si no hay token guardado. Se llama al inicio de
// cualquier página que requiera estar logueado.
function requireAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }
  return token;
}

// Devuelve el header Authorization listo para usar en fetch()
function authHeader() {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
}

// Devuelve los datos del usuario logueado (id, name, email, role) guardados
// en el login, o null si no hay sesión activa.
function getUser() {
  const datos = localStorage.getItem('usuario');
  return datos ? JSON.parse(datos) : null;
}

// Cierra la sesión: borra todo lo guardado y regresa al login.
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}
