# Etapa de construcción
FROM node:20-alpine AS build

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package*.json ./

# Instalar dependencias (usando npm ci para builds reproducibles)
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Compilar la aplicación para producción
# El flag -- asegura que los argumentos se pasen correctamente al script
RUN npm run build -- --configuration production

# Verificar que la compilación fue exitosa
RUN ls -la /app/dist/barberiapp-frontend/browser || (echo "Error: Build output not found" && exit 1)

# Etapa de producción
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Copiar archivos compilados
# En Angular 17+ con application builder, la salida está en dist/project-name/browser
COPY --from=build /app/dist/barberiapp-frontend/browser .

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar que los archivos se copiaron correctamente
RUN ls -la /usr/share/nginx/html || (echo "Error: Files not copied" && exit 1)

# Exponer puerto
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
