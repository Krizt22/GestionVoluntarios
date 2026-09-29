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
