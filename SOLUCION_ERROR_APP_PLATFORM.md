# Solución al Error "Container Terminated" en App Platform

## Problema Identificado

El error "Container Terminated" en DigitalOcean App Platform puede ocurrir por varias razones:

1. **Puerto no configurable**: App Platform puede asignar puertos dinámicos, pero nginx estaba hardcodeado al puerto 80
2. **Falta de logging**: No había suficiente información para diagnosticar problemas
3. **Manejo de errores insuficiente**: El script no validaba correctamente los pasos críticos
4. **Configuración de nginx no validada**: No se verificaba que la configuración fuera válida antes de iniciar

## Soluciones Implementadas

### 1. Puerto Dinámico Configurable

El script `entrypoint.sh` ahora lee la variable de entorno `PORT` (que App Platform inyecta automáticamente):

```bash
PORT=${PORT:-80}  # Usa el puerto de App Platform o 80 por defecto
```

Y nginx se configura para escuchar en ese puerto:
```nginx
listen ${PORT};
```

### 2. Logging Mejorado

Se agregaron mensajes de log en cada paso crítico:
- Inicio de configuración
- Creación de archivos
- Validación de nginx
- Inicio del servidor

Esto permite ver exactamente dónde falla el contenedor en los logs de App Platform.

### 3. Validación de Errores

El script ahora:
- Usa `set -e` para salir inmediatamente si hay un error
- Verifica que los directorios existan
- Verifica que los archivos se creen correctamente
- Valida la configuración de nginx con `nginx -t` antes de iniciar

### 4. Verificación de Configuración de Nginx

Antes de iniciar nginx, se ejecuta `nginx -t` para validar la configuración. Si hay un error, el contenedor falla inmediatamente con un mensaje claro.

## Configuración en App Platform

### Variables de Entorno Recomendadas

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PORT` | (Automático) | App Platform lo configura automáticamente |
| `API_URL` | `/api` | URL base para las peticiones API |
| `BACKEND_URL` | (Opcional) | URL del backend si usas proxy |

### Configuración del Componente

- **Run Command**: Dejar **VACÍO** o usar `/entrypoint.sh`
  - ⚠️ **IMPORTANTE**: Si configuras un Run Command, asegúrate de que sea exactamente `/entrypoint.sh` o déjalo vacío para usar el CMD del Dockerfile
  - ❌ **NO uses**: `nginx -g "daemon off;"` directamente, ya que esto omite el script de configuración

- **HTTP Port**: Configura el puerto que App Platform asignará (normalmente 80 o 8080)

## Cómo Verificar que Funciona

1. **Revisa los logs en App Platform**:
   - Deberías ver mensajes como:
     ```
     === Iniciando configuración del contenedor ===
     PORT: 8080
     API_URL: /api
     ✓ Archivo env-config.js creado
     ✓ Configuración de nginx válida
     === Iniciando nginx en puerto 8080 ===
     ```

2. **Si el contenedor se termina**:
   - Revisa los logs para ver en qué paso falla
   - Verifica que las variables de entorno estén configuradas
   - Asegúrate de que el Run Command esté vacío o sea `/entrypoint.sh`

## Troubleshooting Adicional

### El contenedor se termina inmediatamente

1. Revisa los logs en App Platform - ahora tienen información detallada
2. Verifica que el Run Command esté vacío o sea `/entrypoint.sh`
3. Asegúrate de que el puerto HTTP en App Platform coincida con el que nginx escucha
4. Verifica que las variables de entorno estén configuradas correctamente

### Error: "La configuración de nginx es inválida"

- Revisa los logs para ver el error específico de nginx
- Verifica que `BACKEND_URL` tenga el formato correcto si lo estás usando
- Asegúrate de que el puerto sea un número válido

### Error: "Directorio /usr/share/nginx/html no existe"

- Esto no debería pasar con el Dockerfile actual
- Verifica que el build se completó correctamente
- Revisa que los archivos se copiaron en la etapa de build

## Cambios en los Archivos

### entrypoint.sh
- ✅ Agregado `set -e` para manejo de errores
- ✅ Variable `PORT` configurable
- ✅ Validaciones de directorios y archivos
- ✅ Validación de configuración de nginx
- ✅ Logging detallado en cada paso

### Dockerfile
- ✅ Comentario actualizado sobre el puerto dinámico

### APP_PLATFORM.md
- ✅ Documentación actualizada con la variable PORT
- ✅ Sección de troubleshooting mejorada

