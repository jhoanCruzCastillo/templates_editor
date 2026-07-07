# Credenciales de acceso — Proyecta Fácil (demo)

Usuarios de prueba para el login del template-editor. La validación es **solo frontend**
(mock en `src/data/usuarios.ts`); cuando exista el backend de CodeIgniter 4 estas
credenciales se reemplazan por la tabla de usuarios en MySQL.

El login es único: el sistema detecta automáticamente el rol del usuario ingresado.

| Rol | Usuario | Contraseña | Nombre |
|---|---|---|---|
| Superusuario | `superuser` | `Super#2026` | Carlos Núñez |
| Administrador | `admin` | `Admin#2026` | María Quispe |
| Cliente | `cliente` | `Cliente#2026` | Juan Pérez |

## Notas

- El usuario no distingue mayúsculas/minúsculas; la contraseña sí.
- La sesión se guarda en localStorage (clave `pf_sesion`) y sobrevive recargas.
- Cerrar sesión: botón de salida en la parte inferior del sidebar.
- Rutas protegidas: todas excepto `/login`. Sin sesión activa se redirige al login.

> ⚠️ Estas credenciales son de demostración. No usar en producción.
