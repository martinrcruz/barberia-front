# Troubleshooting: Funciona en Local pero No en DigitalOcean

## Problemas Comunes y Soluciones

### 1. App Platform Sobrescribe el CMD

**Problema**: Si configuraste un "Run Command" en App Platform, esto sobrescribe el CMD del Dockerfile.

**Solución**: 
- ✅ **Deja el Run Command VACÍO** en App Platform
- ✅ O usa exactamente: `/entrypoint.sh`
- ❌ **NO uses**: `nginx -g "daemon off;"` directamente

**Cambio aplicado**: El Dockerfile ahora usa `ENTRYPOINT` en lugar de `CMD`, lo que hace que el script siempre se ejecute, incluso si App Platform intenta sobrescribir el comando.

### 2. Puerto No Coincide

**Problema**: App Platform puede asignar un puerto diferente al 80, y nginx no lo está leyendo correctamente.

**Solución**:
- El script ahora lee la variable `PORT` que App Platform inyecta automáticamente
- También intenta leer de variables alternativas: `APP_PORT`, `HTTP_PORT`, `LISTEN_PORT`
- Valida que el puerto sea un número válido

**Verificación**:
1. En App Platform, ve a tu componente
2. Verifica el "HTTP Port" configurado
3. Revisa los logs para ver qué puerto está usando nginx:
   ```
   === Iniciando nginx en puerto 8080 ===
   ```

### 3. Variables de Entorno No Se Inyectan

**Problema**: Las variables de entorno no están disponibles cuando el script se ejecuta.

**Solución**:
- Asegúrate de configurar las variables en App Platform:
  - Ve a tu App → Settings → App-Level Environment Variables
  - O en el componente específico → Environment Variables

**Variables necesarias**:
- `API_URL`: `/api` (o la URL completa de tu backend)
- `BACKEND_URL`: (opcional) Solo si usas proxy
- `PORT`: (automático) App Platform lo inyecta, pero puedes sobrescribirlo

### 4. El Script No Se Ejecuta

**Problema**: El script entrypoint.sh no se está ejecutando.

**Solución**:
- Verifica que el archivo existe en el Dockerfile:
  ```dockerfile
  COPY entrypoint.sh /entrypoint.sh
  RUN chmod +x /entrypoint.sh
  ```
- Verifica que tiene permisos de ejecución (el Dockerfile ya lo hace)
- Usa `ENTRYPOINT` en lugar de `CMD` (ya aplicado)

### 5. Nginx No Inicia

**Problema**: Nginx falla al iniciar.

**Verificación**:
1. Revisa los logs en App Platform
2. Busca el mensaje: `✓ Configuración de nginx válida`
3. Si no aparece, busca errores de nginx antes de ese mensaje

**Posibles causas**:
- Configuración de nginx inválida
- Puerto ya en uso
- Permisos insuficientes

### 6. El Contenedor Se Termina Inmediatamente

**Problema**: El contenedor inicia pero se termina de inmediato.

**Diagnóstico**:
1. Revisa los logs completos en App Platform
2. Busca mensajes de error específicos
3. Verifica que veas todos estos mensajes en orden:
   ```
   === Iniciando configuración del contenedor ===
   PORT: [número]
   API_URL: [valor]
   Creando archivo env-config.js...
   ✓ Archivo env-config.js creado
   Configurando nginx...
   ✓ Configuración de nginx completada
   Verificando configuración de nginx...
   ✓ Configuración de nginx válida
   === Iniciando nginx en puerto [número] ===
   ```

**Si falta algún mensaje**: El script falló en ese paso. Revisa el error específico.

## Checklist de Configuración en App Platform

### Configuración del Componente

- [ ] **Type**: Web Service
- [ ] **Source Directory**: `frontend`
- [ ] **Build Command**: `npm ci --legacy-peer-deps && npm run build`
- [ ] **Run Command**: **VACÍO** (dejar sin nada)
- [ ] **HTTP Port**: `80` (o el que App Platform asigne)

### Variables de Entorno

- [ ] `API_URL` configurada (ej: `/api`)
- [ ] `BACKEND_URL` configurada si usas proxy (opcional)
- [ ] `PORT` NO necesita configurarse manualmente (App Platform lo inyecta)

### Verificación Post-Despliegue

1. [ ] Revisa los logs - deberías ver todos los mensajes del script
2. [ ] Verifica que nginx esté escuchando en el puerto correcto
3. [ ] Prueba acceder a la aplicación
4. [ ] Verifica que `/env-config.js` sea accesible y tenga el contenido correcto

## Comandos Útiles para Debugging

Si tienes acceso SSH al contenedor (raro en App Platform, pero útil para debugging local):

```bash
# Verificar que el script existe y tiene permisos
ls -la /entrypoint.sh

# Verificar variables de entorno
env | grep -E "(PORT|API_URL|BACKEND_URL)"

# Verificar configuración de nginx
nginx -t

# Verificar que nginx está escuchando
netstat -tlnp | grep nginx
```

## Comparación: Local vs App Platform

| Aspecto | Local (Docker) | App Platform |
|--------|----------------|--------------|
| Puerto | Mapeado manualmente (`-p 8080:80`) | Asignado automáticamente |
| Variables de entorno | Pasadas con `-e` | Configuradas en la UI |
| CMD/ENTRYPOINT | Se ejecuta tal cual | Puede ser sobrescrito si configuras Run Command |
| Logs | `docker logs` | UI de App Platform |
| Recursos | Limitados por tu máquina | Limitados por el plan de App Platform |

## Cambios Aplicados para Mejorar Compatibilidad

1. ✅ Cambiado `CMD` a `ENTRYPOINT` - El script siempre se ejecuta
2. ✅ Mejorado manejo de la variable `PORT` - Lee de múltiples fuentes
3. ✅ Validación del puerto - Asegura que sea un número válido
4. ✅ Logging mejorado - Más información para debugging
5. ✅ Validación de nginx - Verifica configuración antes de iniciar

## Si Nada Funciona

1. **Revisa los logs completos** en App Platform - Ahora tienen mucha más información
2. **Verifica la configuración del componente** - Asegúrate de que el Run Command esté vacío
3. **Prueba con un contenedor mínimo** - Crea un Dockerfile simple solo con nginx para verificar que App Platform puede ejecutarlo
4. **Contacta soporte de DigitalOcean** - Proporciona los logs completos del contenedor

