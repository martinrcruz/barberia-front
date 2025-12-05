// Leer configuración de window.__ENV__ si está disponible (inyectada en tiempo de ejecución)
// Esto permite configurar la API URL desde variables de entorno en App Platform

// Declaración de tipo para window.__ENV__
declare global {
  interface Window {
    __ENV__?: {
      apiUrl: string;
      backendUrl?: string;
      production: boolean;
    };
  }
}

const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.apiUrl) {
    return window.__ENV__.apiUrl;
  }
  // Valor por defecto (solo para desarrollo local)
  return 'http://localhost:8080/api';
};

export const environment = {
  production: true,
  apiUrl: getApiUrl(),
  appName: 'BarberiApp',
  version: '1.0.0'
};

