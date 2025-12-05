/**
 * Declaración de tipos para la configuración de entorno inyectada en tiempo de ejecución
 * Esta configuración se genera dinámicamente por el script entrypoint.sh
 */
interface Window {
  __ENV__?: {
    apiUrl: string;
    backendUrl?: string;
    production: boolean;
  };
}

