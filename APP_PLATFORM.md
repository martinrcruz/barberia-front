# Guía de Despliegue en DigitalOcean App Platform

Esta guía explica cómo desplegar el frontend de BarberiApp en DigitalOcean App Platform.

## Requisitos Previos

- Cuenta de DigitalOcean
- Repositorio Git (GitHub, GitLab, o Bitbucket)
- Backend desplegado y accesible

## Configuración en App Platform

### 1. Crear una Nueva App

1. Ve a [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Haz clic en "Create App"
3. Conecta tu repositorio Git
4. Selecciona la rama que deseas desplegar

### 2. Configurar el Componente Frontend

#### Configuración Básica

- **Type**: Web Service
- **Name**: `barberiapp-frontend` (o el nombre que prefieras)
- **Source Directory**: `frontend`
- **Build Command**: `npm ci --legacy-peer-deps && npm run build`
- **Run Command**: **DEJAR VACÍO** (el Dockerfile usa ENTRYPOINT, así que el script siempre se ejecuta)
  - ⚠️ **IMPORTANTE**: Si configuras un Run Command, esto puede interferir con el ENTRYPOINT
  - ✅ **Recomendado**: Dejar completamente vacío
- **HTTP Port**: `80` (o el puerto que App Platform asigne - se maneja automáticamente con la variable PORT)

#### Variables de Entorno

Configura las siguientes variables de entorno en App Platform:

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `PORT` | Puerto en el que nginx escuchará. App Platform lo configura automáticamente, pero puedes sobrescribirlo. | `80` o `8080` | No (por defecto: `80`) |
| `API_URL` | URL base para las peticiones API. Si el backend está en el mismo dominio, usa `/api`. Si está en otro servicio, usa la URL completa. | `/api` o `https://api.tudominio.com/api` | No (por defecto: `/api`) |
| `BACKEND_URL` | URL completa del backend para el proxy de nginx. Solo necesario si quieres usar el proxy integrado. | `http://backend:8080` o `https://api.tudominio.com` | No |

**Nota**: Si tu backend está en otro servicio de App Platform, puedes usar la variable de entorno interna del servicio. Por ejemplo, si tu backend se llama `barberiapp-backend`, puedes usar `${barberiapp-backend.PRIVATE_URL}`.

### 3. Configuración del Dockerfile

El Dockerfile está configurado para:
- Construir la aplicación Angular en modo producción
- Servir los archivos estáticos con nginx
- Inyectar variables de entorno en tiempo de ejecución mediante el script `entrypoint.sh`

### 4. Opciones de Configuración

#### Opción A: Backend en el mismo App Platform (Recomendado)

Si tu backend también está en App Platform:

1. Configura `API_URL` como `/api`
2. Configura `BACKEND_URL` como `${nombre-del-backend.PRIVATE_URL}` (reemplaza `nombre-del-backend` con el nombre de tu servicio backend)
3. El proxy de nginx redirigirá las peticiones `/api/*` al backend

#### Opción B: Backend externo

Si tu backend está en otro lugar:

1. Configura `API_URL` como la URL completa del backend (ej: `https://api.tudominio.com/api`)
2. No configures `BACKEND_URL` (o déjalo vacío)
3. Las peticiones se harán directamente desde el navegador al backend

**Importante**: Si usas un backend externo, asegúrate de configurar CORS en el backend para permitir peticiones desde el dominio del frontend.

### 5. Buildpacks y Configuración Avanzada

App Platform detectará automáticamente que es una aplicación Node.js y usará el Dockerfile si está presente. No necesitas configurar buildpacks manualmente.

### 6. Verificación Post-Despliegue

Después del despliegue:

1. Verifica que la aplicación carga correctamente
2. Abre la consola del navegador y verifica que `window.__ENV__` está definido
3. Verifica que las peticiones API funcionan correctamente
4. Revisa los logs en App Platform si hay problemas

## Solución de Problemas

### La aplicación no carga / Container Terminated

- **Verifica los logs en App Platform** - El script entrypoint.sh ahora incluye logging detallado
- Verifica que el build se completó correctamente
- Asegúrate de que la variable `PORT` esté configurada o que App Platform la esté inyectando automáticamente
- Verifica que el puerto HTTP en App Platform coincida con el que nginx está escuchando
- Si el contenedor se termina inmediatamente, revisa los logs para ver en qué paso falla el script
- Verifica que el directorio `/usr/share/nginx/html` existe y contiene los archivos compilados

### Las peticiones API fallan

- Verifica que `API_URL` está configurada correctamente
- Si usas proxy, verifica que `BACKEND_URL` apunta al backend correcto
- Revisa la consola del navegador para ver errores de CORS
- Verifica que el backend está accesible

### Variables de entorno no se aplican

- Asegúrate de que las variables están configuradas en App Platform
- Verifica que el script `entrypoint.sh` se está ejecutando (revisa los logs)
- Abre `https://tu-app.com/env-config.js` en el navegador para verificar la configuración

## Estructura de Archivos

```
frontend/
├── Dockerfile              # Configuración de Docker
├── entrypoint.sh          # Script de inicio que inyecta variables de entorno
├── nginx.conf             # Configuración base de nginx (puede ser sobrescrita por entrypoint.sh)
├── package.json           # Dependencias y scripts
├── angular.json           # Configuración de Angular
└── src/
    ├── index.html         # HTML principal (incluye env-config.js)
    └── environments/
        └── environment.prod.ts  # Lee configuración de window.__ENV__
```

## Notas Adicionales

- El script `entrypoint.sh` se ejecuta cada vez que el contenedor inicia
- Las variables de entorno se inyectan en `env-config.js` que se carga antes de Angular
- El archivo `env-config.js` se genera dinámicamente, no está en el repositorio
- Si necesitas cambiar la configuración, actualiza las variables de entorno en App Platform y reinicia el servicio

