/**
 * Resolución de API Key para el proveedor LLM en producción.
 * Prioridad:
 * 1. API Key guardada dinámicamente en MongoDB desde `/laboratorio`
 * 2. Variable de entorno `process.env.OPENAI_API_KEY` en el servidor
 */

function sanitizeKey(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^["']|["']$/g, '').trim();
}

export function resolveOpenAiApiKey(dbKey?: string): string {
  const cleanDb = sanitizeKey(dbKey);
  if (cleanDb.startsWith('sk-')) {
    return cleanDb;
  }
  const cleanEnv = sanitizeKey(process.env.OPENAI_API_KEY);
  if (cleanEnv.startsWith('sk-')) {
    return cleanEnv;
  }
  return '';
}
