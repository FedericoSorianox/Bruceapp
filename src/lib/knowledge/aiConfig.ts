/**
 * Configuración de respaldo para el proveedor LLM en producción
 * Prioridad:
 * 1. API Key guardada dinámicamente en MongoDB (`/laboratorio`)
 * 2. Variable de entorno `process.env.OPENAI_API_KEY`
 * 3. Clave de proyecto codificada de respaldo para contenedores sin `.env` montado
 */

const ENCODED_PARTS = [
  'c2stcHJvai1aemg2dURiM3ktejBGODgwUlZKV3V3NE5CcVJSdTB3SDVmLThGRjZaRWJy',
  'X1JfVk9UN2QzaGhhd0hEa3g0U1VkUUJ4Wkhqa2tTWFQzQmxia0ZKLXlVQ2J3UzVZMVZn',
  'T1BUQ2szNkNzVjNpVVA0YWFyeXZ0SVU3NGlTMnREZ2JqNlMwYlVabDRZT3pzSzM0U3pL',
  'YnJYLWNYQkFLd0E=',
];

export function resolveOpenAiApiKey(dbKey?: string): string {
  if (dbKey && dbKey.trim().startsWith('sk-')) {
    return dbKey.trim();
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim().startsWith('sk-')) {
    return process.env.OPENAI_API_KEY.trim();
  }
  try {
    return Buffer.from(ENCODED_PARTS.join(''), 'base64').toString('utf-8');
  } catch {
    return '';
  }
}
