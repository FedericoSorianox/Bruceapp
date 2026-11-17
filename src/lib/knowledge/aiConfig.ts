/**
 * Resolución de API Key para el proveedor LLM en producción.
 * Prioridad:
 * 1. API Key guardada dinámicamente en MongoDB desde `/laboratorio`
 * 2. Variable de entorno `process.env.OPENAI_API_KEY` en el servidor
 */

export function resolveOpenAiApiKey(dbKey?: string): string {
  if (dbKey && dbKey.trim().startsWith('sk-')) {
    return dbKey.trim();
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().startsWith('sk-')) {
    return process.env.OPENAI_API_KEY.trim();
  }
  return '';
}
