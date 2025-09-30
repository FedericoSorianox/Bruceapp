/**
 * Configuración y conexión a MongoDB con Mongoose
 * 
 * Este archivo maneja la conexión singleton a MongoDB para evitar múltiples conexiones
 * innecesarias en el entorno serverless de Next.js y Vercel.
 * 
 * Características principales:
 * - Conexión singleton (una sola instancia)
 * - Manejo automático de reconexión
 * - Optimizado para entornos serverless
 * - Logs detallados para debugging
 * - Soporte para desarrollo y producción
 */

import mongoose from 'mongoose';

// Tipos para manejar la conexión global
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  } | undefined;
}

// Variable global para mantener la conexión en desarrollo (hot reload)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establece conexión a MongoDB usando Mongoose
 * 
 * @returns {Promise<mongoose.Connection>} - Conexión activa a MongoDB
 * @throws {Error} - Si no se puede conectar a la base de datos
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Si ya existe una conexión activa, retornarla
  if (cached && cached.conn) {
    console.log('🔄 Reutilizando conexión existente a MongoDB');
    return cached.conn;
  }

  // Verificar que existe la URL de conexión
  if (!process.env.MONGODB_URI) {
    // En producción, devolver conexión mock para evitar fallos en build
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ MONGODB_URI no definida en producción - funciones de DB estarán limitadas');
      // Retornar una conexión mock que no haga nada
      return cached?.conn || { readyState: 99 } as mongoose.Connection;
    }
    throw new Error(
      '❌ MONGODB_URI no está definida en las variables de entorno.\n' +
      'Crea un archivo .env.local con: MONGODB_URI=mongodb://localhost:27017/bruceapp'
    );
  }

  // Si no hay promesa de conexión, crear una nueva
  if (!cached || !cached.promise) {
    console.log('🚀 Estableciendo nueva conexión a MongoDB...');
    
    // Configuración de opciones de Mongoose para producción
    const opts = {
      bufferCommands: false,           // Desactivar buffer de comandos en serverless
      maxPoolSize: 10,                 // Máximo 10 conexiones concurrentes
      serverSelectionTimeoutMS: 5000,  // Timeout de selección de servidor: 5s
      socketTimeoutMS: 45000,          // Timeout de socket: 45s
      family: 4,                       // Usar IPv4 preferentemente
      retryWrites: true,               // Reintentar escrituras automáticamente
      w: 1,                           // Confirmación de escritura
    };

    // Crear la promesa de conexión
    cached!.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Conexión a MongoDB establecida exitosamente');
        console.log(`📍 Base de datos: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
        
        // Configurar listeners para eventos de conexión
        mongoose.connection.on('connected', () => {
          console.log('🔗 Mongoose conectado a MongoDB');
        });

        mongoose.connection.on('error', (err) => {
          console.error('❌ Error de conexión MongoDB:', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('🔌 Mongoose desconectado de MongoDB');
        });

        return mongoose.connection;
      })
      .catch((error) => {
        console.error('💥 Error al conectar a MongoDB:', error);
        cached!.promise = null; // Reset de la promesa en caso de error
        throw error;
      });
  }

  try {
    // Esperar a que se resuelva la promesa de conexión
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch (error) {
    // Reset en caso de error
    cached!.promise = null;
    throw error;
  }
}

/**
 * Desconecta de MongoDB (útil para testing o cierre de aplicación)
 * 
 * @returns {Promise<void>}
 */
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached!.conn = null;
    cached!.promise = null;
    console.log('🔌 Desconectado de MongoDB');
  }
}

/**
 * Verifica el estado de la conexión a MongoDB
 * 
 * @returns {string} - Estado actual de la conexión
 */
export function getConnectionStatus(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Función principal para obtener conexión a MongoDB
 * Esta es la función que debes importar en tus API routes
 * 
 * @returns {Promise<mongoose.Connection>} - Conexión activa a MongoDB
 */
export default connectDB;

/**
 * Información de la base de datos para debugging
 * 
 * @returns {object} - Información detallada de la conexión
 */
export function getDBInfo() {
  const connection = mongoose.connection;
  return {
    status: getConnectionStatus(),
    name: connection.name,
    host: connection.host,
    port: connection.port,
    readyState: connection.readyState,
    modelsCompiled: Object.keys(connection.models),
  };
}

/**
 * Middleware helper para verificar conexión en API routes
 * 
 * @param handler - Handler de la API route
 * @returns Handler con verificación de conexión
 */
export function withDB<T = Response>(
  handler: (req: Request, context?: unknown) => Promise<T>
) {
  return async (req: Request, context?: unknown): Promise<T> => {
    try {
      // Asegurar conexión antes de ejecutar el handler
      await connectDB();
      return await handler(req, context);
    } catch (error) {
      console.error('❌ Error en middleware de DB:', error);
      throw error;
    }
  };
}
