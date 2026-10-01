# Gestión de Voluntarios – Fundación Desarrollo Comunitario (FDC)

Sistema web para la gestión de voluntarios de una ONG ficticia (Fundación Desarrollo Comunitario). Permite administrar usuarios y roles, perfiles de voluntarios, campañas, actividades, inscripciones, asignación de supervisores, control de asistencia, cálculo de horas de servicio, historial de participación y reportes.

Proyecto desarrollado para el curso **INS104 – Ingeniería de Software**, Universidad Don Bosco, bajo la metodología **Scrum** (8 sprints de 2 semanas). Instructora: Ing. Carmen Morales.

---

## Integrantes del equipo

| Nombre | Rol en el proyecto |
|---|---|
| Cristian Enrique Pineda Muñoz | Product Owner |
| Leonel Oswaldo Rosales Franco | Scrum Master |
| Fernando Josue Quintanilla Avalos | Desarrollador Frontend |
| Edwin Alexis Portillo Mendoza | Desarrollador Backend |

---

## Tecnologías utilizadas

**Backend**
- Node.js + Express
- MySQL (driver `mysql2/promise`)
- `jsonwebtoken` (autenticación JWT)
- `bcrypt` (hash de contraseñas)
- `dotenv` (variables de entorno)
- `cors`

**Frontend**
- HTML, CSS y JavaScript "vanilla" (sin frameworks)
- Fetch API para consumir la API REST

**Base de datos**
- MySQL, administrado localmente con XAMPP / phpMyAdmin

---

## Estructura de carpetas

```
GestionVoluntarios/
├── backend/
│   ├── config/
│   │   └── db.js                  # Pool de conexión a MySQL
│   ├── middleware/
│   │   └── auth.js                # Verificación de token JWT y de roles
│   ├── routes/
│   │   ├── auth.js                # Login
│   │   ├── users.js               # CRUD de usuarios
│   │   ├── profile.js             # Perfil de voluntario
│   │   ├── campaigns.js           # Campañas
│   │   ├── activities.js          # Actividades
│   │   ├── registrations.js       # Inscripciones
│   │   ├── activitySupervisors.js # Asignación de supervisores
│   │   ├── attendance.js          # Asistencia y cálculo de horas
│   │   ├── historial.js           # Historial de participación
│   │   └── reportes.js            # Reportes (JSON y CSV)
│   ├── server.js                  # Punto de entrada del backend
│   ├── package.json
│   ├── .env                       # Variables de entorno (NO se sube al repo)
│   └── .env.example               # Plantilla de referencia para .env
│
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── config.js               # URL base del backend (API_BASE_URL)
│   │   ├── auth-helper.js          # Helpers de sesión (requireAuth, authHeader)
│   │   └── *.js                    # Un script por cada página .html
│   └── *.html                      # Una página por funcionalidad
│
└── database/
    └── schema_mysql.sql            # Script de creación de la base de datos
```

---

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado (incluye npm)
- [XAMPP](https://www.apachefriends.org/) instalado, con los módulos **Apache** y **MySQL**
- Un navegador web (Chrome recomendado)
- Un editor de código (VS Code recomendado)

---

## Instalación y configuración

1. **Clonar el repositorio**
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```

2. **Levantar MySQL**
   - Abrir el panel de XAMPP e iniciar el servicio **MySQL** (y Apache si vas a usar phpMyAdmin).

3. **Crear la base de datos**
   - Entrar a phpMyAdmin (normalmente `http://localhost/phpmyadmin` o `http://localhost:8080/phpmyadmin`, según el puerto de tu Apache).
   - Ir a la pestaña **SQL** y pegar el contenido completo de `database/schema_mysql.sql`, luego ejecutar.
   - Esto crea la base `volunteer_management` con sus 8 tablas y los 4 roles iniciales (admin, coordinator, supervisor, volunteer).

4. **Configurar las variables de entorno del backend**
   - Dentro de `backend/`, copiar `.env.example` y renombrar la copia a `.env`.
   - Completar los valores según tu entorno, por ejemplo:
     ```
     PORT=3000
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=volunteer_management
     JWT_SECRET=cambia_esto_por_una_clave_larga_y_secreta
     JWT_EXPIRES_IN=8h
     ```

5. **Instalar las dependencias del backend**
   ```
   cd backend
   npm install
   ```

6. **Iniciar el backend**
   ```
   npm run dev
   ```
   Si todo está bien configurado, debería mostrar `Servidor corriendo en http://localhost:3000` (o el puerto que hayas puesto en `.env`).

7. **Si el puerto 3000 ya está ocupado en tu computadora:**
   - Cambia `PORT` en `backend/.env` por otro número (ej. `3001`).
   - Abre `frontend/js/config.js` y actualiza la URL en `API_BASE_URL` para que coincida con ese mismo puerto. Es el único archivo del frontend que hay que tocar — todos los demás scripts toman la URL desde ahí.

8. **Abrir el frontend**
   - Abre cualquier archivo `.html` dentro de `frontend/` directamente en el navegador (doble clic, o clic derecho → "Abrir con" tu navegador). No necesita un servidor propio, ya que todo el procesamiento ocurre contra el backend vía la API.
   - Empieza por `login.html`.

---

## Usuario de prueba

Para la primera entrada al sistema, crea un usuario administrador directamente en la base de datos (tabla `users`), o pide a tu equipo las credenciales del usuario admin ya existente en el proyecto. El hash de la contraseña se genera con:
```
node -e "console.log(require('bcrypt').hashSync('TU_CONTRASEÑA', 10))"
```
y se pega en el campo `password_hash` de la fila correspondiente desde phpMyAdmin.

---

## Roles del sistema

| Rol | Puede hacer |
|---|---|
| **admin** | Gestión total: usuarios, campañas, actividades, inscripciones, supervisores, reportes |
| **coordinator** | Crear/editar campañas y actividades, aprobar o rechazar inscripciones, asignar supervisores, ver reportes |
| **supervisor** | Ver participantes aprobados de sus actividades, registrar asistencia (check-in/check-out) |
| **volunteer** | Ver y editar su perfil, ver actividades disponibles, inscribirse, ver sus propias inscripciones e historial |

---

## Endpoints principales de la API

Todas las rutas (excepto `/api/auth/login`) requieren el header `Authorization: Bearer <token>`.

| Módulo | Ruta base | Descripción |
|---|---|---|
| Autenticación | `POST /api/auth/login` | Inicio de sesión, devuelve el token JWT |
| Usuarios | `/api/usuarios` | CRUD de usuarios (solo admin) |
| Perfil | `/api/perfil` | Ver y editar el perfil del voluntario logueado |
| Campañas | `/api/campanas` | CRUD de campañas |
| Actividades | `/api/actividades` | CRUD de actividades, listado de participantes |
| Inscripciones | `/api/inscripciones` | Solicitar, listar, aprobar/rechazar inscripciones |
| Supervisores | `/api/asignaciones-supervisor` | Asignar y listar supervisores por actividad |
| Asistencia | `/api/asistencia` | Check-in, check-out y total de horas acumuladas |
| Historial | `/api/historial` | Historial de participación del voluntario, con filtros |
| Reportes | `/api/reportes` | Voluntarios activos, participación/asistencia y horas (JSON o CSV con `?formato=csv`) |

---

## Funcionalidades implementadas

Todas las historias de usuario del Product Backlog fueron implementadas:

- **Épica 1 – Autenticación y usuarios:** HU-01 a HU-04
- **Épica 2 – Perfil del voluntario:** HU-05, HU-06
- **Épica 3 – Campañas:** HU-07, HU-08
- **Épica 4 – Actividades:** HU-09, HU-10
- **Épica 5 – Inscripciones:** HU-11 a HU-13
- **Épica 6 – Supervisores:** HU-14
- **Épica 7 – Control de asistencia:** HU-15, HU-16
- **Épica 8 – Horas e historial:** HU-17, HU-18
- **Épica 9 – Reportes:** HU-19
- **Épica 10 – Permisos y roles:** HU-20
- **Épica 11 – No funcionales:** HU-21 (diseño responsivo), HU-22 (seguridad de datos)

---

## Notas de seguridad

- Las contraseñas nunca se almacenan en texto plano: se hashean con `bcrypt` antes de guardarse.
- La sesión se maneja con **JWT**, con expiración configurable (`JWT_EXPIRES_IN`).
- Cada ruta protegida valida el token y, cuando aplica, el rol del usuario (`verificarToken` / `verificarRol`).
- El archivo `.env` (que contiene credenciales y la clave secreta del JWT) está excluido del repositorio mediante `.gitignore`.
- CORS está configurado de forma abierta (`app.use(cors())`) para facilitar el desarrollo y las pruebas entre distintas máquinas del equipo; en un entorno de producción real se restringiría a un origen específico.
