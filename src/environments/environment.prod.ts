// Leer configuración de window.__ENV__ si está disponible (inyectada en tiempo de ejecución)
// Esto permite configurar la API URL desde variables de entorno en App Platform
// Los tipos están definidos en environment.d.ts

const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.apiUrl) {
    return window.__ENV__.apiUrl;
  }
  // Valor por defecto
  return '/api';
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  appName: 'BarberiApp',
  version: '1.0.0'
};

