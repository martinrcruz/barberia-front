#!/bin/sh
set -e

# Script de inicio para App Platform de DigitalOcean
# Inyecta variables de entorno en el index.html antes de iniciar nginx

# Valores por defecto
API_URL=${API_URL:-/api}
BACKEND_URL=${BACKEND_URL:-}
PORT=${PORT:-80}

echo "=== Iniciando configuración del contenedor ==="
echo "PORT: ${PORT}"
echo "API_URL: ${API_URL}"
echo "BACKEND_URL: ${BACKEND_URL:-'No configurado (sin proxy)'}"

# Verificar que el directorio existe
if [ ! -d "/usr/share/nginx/html" ]; then
  echo "ERROR: Directorio /usr/share/nginx/html no existe"
  exit 1
fi

# Crear archivo de configuración JavaScript que se cargará antes de Angular
echo "Creando archivo env-config.js..."
cat > /usr/share/nginx/html/env-config.js <<EOF
window.__ENV__ = {
  apiUrl: '${API_URL}',
  backendUrl: '${BACKEND_URL}',
  production: true
};
EOF

if [ ! -f "/usr/share/nginx/html/env-config.js" ]; then
  echo "ERROR: No se pudo crear env-config.js"
  exit 1
fi

echo "✓ Archivo env-config.js creado"

# Si se proporciona BACKEND_URL, actualizar nginx.conf para usar proxy
if [ -n "$BACKEND_URL" ]; then
  echo "Configurando nginx con proxy al backend..."
  # Crear configuración de nginx con proxy
  cat > /etc/nginx/conf.d/default.conf <<NGINX_CONF
server {
    listen ${PORT};
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Configuración de gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Servir archivos estáticos
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy para API
    location /api {
        proxy_pass ${BACKEND_URL};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINX_CONF
else
  echo "Configurando nginx sin proxy..."
  # Usar configuración sin proxy (para cuando el backend está en otro servicio)
  cat > /etc/nginx/conf.d/default.conf <<NGINX_CONF
server {
    listen ${PORT};
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Configuración de gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Servir archivos estáticos
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Cache para assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
NGINX_CONF
fi

echo "✓ Configuración de nginx completada"
echo "Verificando configuración de nginx..."
nginx -t || {
  echo "ERROR: La configuración de nginx es inválida"
  exit 1
}

echo "✓ Configuración de nginx válida"
echo "=== Iniciando nginx en puerto ${PORT} ==="

# Iniciar nginx en primer plano
exec nginx -g "daemon off;"

