/**
 * Índice de modelos de MongoDB
 * 
 * Centraliza la exportación de todos los modelos de Mongoose para la aplicación Bruce.
 * Facilita la importación y gestión de modelos desde otros archivos.
 * 
 * Modelos incluidos:
 * - Cultivo: Gestión de cultivos agrícolas
 * - Tarea: Planificación y tareas de cultivo
 * - Nota: Sistema de notas y documentación
 * - Comentario: Comentarios específicos de cultivos
 * - MensajeChat: Chat con IA y análisis de imágenes
 */

// Importar todos los modelos
import Cultivo from './Cultivo';
import Tarea from './Tarea';
import Nota from './Nota';
import Comentario from './Comentario';
import MensajeChat from './MensajeChat';
import Usuario from './Usuario';

// Exportar modelos individualmente para importación específica
export { Cultivo, Tarea, Nota, Comentario, Usuario };
export type { MensajeChat };

// Exportar tipos de documentos para TypeScript
export type { CultivoDocument } from './Cultivo';
export type { TareaDocument } from './Tarea';
export type { NotaDocument } from './Nota';
export type { ComentarioDocument } from './Comentario';
export type { MensajeChatDocument } from './MensajeChat';
export type { UsuarioDocument } from './Usuario';

// Exportar objeto con todos los modelos para facilitar iteración
export const Models = {
  Cultivo,
  Tarea,
  Nota,
  Comentario,
  MensajeChat,
  Usuario
} as const;

// Lista de nombres de modelos para validación y utilidades
export const ModelNames = ['Cultivo', 'Tarea', 'Nota', 'Comentario', 'MensajeChat', 'Usuario'] as const;
export type ModelName = typeof ModelNames[number];

/**
 * Función helper para obtener un modelo por nombre
 * Útil para operaciones dinámicas o genéricas
 * 
 * @param name - Nombre del modelo
 * @returns Modelo de Mongoose correspondiente
 */
export function getModel(name: ModelName) {
  return Models[name];
}

/**
 * Función para verificar si todos los modelos están correctamente registrados
 * Útil para debugging y verificación de conexión
 * 
 * @returns Objeto con el estado de cada modelo
 */
export function checkModelsStatus() {
  return ModelNames.reduce((status, name) => {
    const model = Models[name];
    status[name] = {
      registered: !!model,
      collection: model?.collection?.name,
      connected: model?.db?.readyState === 1
    };
    return status;
  }, {} as Record<ModelName, { registered: boolean; collection?: string; connected: boolean }>);
}

/**
 * Lista de todas las colecciones que se crearán en MongoDB
 * Útil para scripts de inicialización y limpieza
 */
export const CollectionNames = [
  'cultivos',
  'tareas',
  'notas',
  'comentarios',
  'mensajes_chat',
  'usuarios'
] as const;

export type CollectionName = typeof CollectionNames[number];

// Exportación por defecto con todos los modelos
export default Models;
