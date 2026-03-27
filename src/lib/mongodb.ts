/**
 * Configuración y conexión a MongoDB con Mongoose - Multi-Database
 *
 * Este archivo maneja conexiones múltiples a MongoDB donde cada admin tiene su propia base de datos.
 * Sistema de multi-tenancy por base de datos separada.
 *
 * Características principales:
 * - Conexión por base de datos (una por admin)
 * - Manejo automático de reconexión
 * - Optimizado para entornos serverless
 * - Logs detallados para debugging
 * - Soporte para desarrollo y producción
 */

import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Cultivo from '@/lib/models/Cultivo';
import Tarea from '@/lib/models/Tarea';
import Nota from '@/lib/models/Nota';
import Comentario from '@/lib/models/Comentario';
import Usuario from '@/lib/models/Usuario';

// Tipos para manejar múltiples conexiones globales
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    connections: Map<string, { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null }>;
    globalConn: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
  } | undefined;
}

// Variable global para mantener conexiones múltiples en desarrollo (hot reload)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    connections: new Map(),
    globalConn: { conn: null, promise: null }
  };
}

/**
 * Genera el nombre de la base de datos global
 * @returns Nombre de la base de datos principal
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDatabaseName(_adminEmail?: string): string {
  // Retornar siempre el nombre de la base de datos principal
  return 'canopia_main';
}

/**
 * Registra todos los modelos de la aplicación en una instancia de Mongoose
 * @param mongooseInstance - Instancia de Mongoose donde registrar los modelos
 */
export function registerModels(mongooseInstance: mongoose.Mongoose): void {
  // Registrar cada modelo en la instancia específica
  if (!mongooseInstance.models.Cultivo) {
    mongooseInstance.model('Cultivo', Cultivo.schema);
  }
  if (!mongooseInstance.models.Tarea) {
    mongooseInstance.model('Tarea', Tarea.schema);
  }
  if (!mongooseInstance.models.Nota) {
    mongooseInstance.model('Nota', Nota.schema);
  }
  if (!mongooseInstance.models.Comentario) {
    mongooseInstance.model('Comentario', Comentario.schema);
  }
  if (!mongooseInstance.models.Usuario) {
    mongooseInstance.model('Usuario', Usuario.schema);
  }

  // console.log('✅ Modelos registrados en instancia de Mongoose');
}

/**
 * Crea un esquema específico para conexión (Wrapper para compatibilidad)
 * En la nueva arquitectura de BD única, esto solo devuelve el modelo estándar
 */
function createModelForConnection<T extends mongoose.Document = mongoose.Document>(
  baseSchema: mongoose.Schema<T>,
  collectionName: string,
  connection: mongoose.Connection
): mongoose.Model<T> {
  // Simplemente devolver el modelo asociado a la conexión
  // Si ya existe, devolverlo
  if (connection.models[collectionName]) {
    return connection.models[collectionName] as mongoose.Model<T>;
  }

  // Si no, crearlo
  return connection.model<T>(collectionName, baseSchema);
}

/**
 * Obtiene el modelo Cultivo para una conexión específica
 */
export function getCultivoModel(connection: mongoose.Connection) {
  return createModelForConnection(Cultivo.schema, 'Cultivo', connection);
}

/**
 * Obtiene el modelo Tarea para una conexión específica
 */
export function getTareaModel(connection: mongoose.Connection) {
  return createModelForConnection(Tarea.schema, 'Tarea', connection);
}

/**
 * Obtiene el modelo Nota para una conexión específica
 */
export function getNotaModel(connection: mongoose.Connection) {
  return createModelForConnection(Nota.schema, 'Nota', connection);
}

/**
 * Obtiene el modelo Comentario para una conexión específica
 */
export function getComentarioModel(connection: mongoose.Connection) {
  return createModelForConnection(Comentario.schema, 'Comentario', connection);
}

/**
 * Obtiene el modelo Usuario para una conexión específica
 */
export function getUsuarioModel(connection: mongoose.Connection) {
  return createModelForConnection(Usuario.schema, 'Usuario', connection);
}

/**
 * Establece conexión a la base de datos principal
 * Mantiene la firma (adminEmail) por compatibilidad pero conecta a la DB global
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function connectToUserDB(adminEmail: string): Promise<mongoose.Connection> {
  // Asegurar que cached esté inicializado
  if (!cached) {
    cached = global.mongoose = {
      connections: new Map(),
      globalConn: { conn: null, promise: null }
    };
  }

  // Usar siempre la DB principal
  const dbName = getDatabaseName();
  const cacheKey = `db_${dbName}`;

  // Si ya existe una conexión activa para esta DB, retornarla
  const cachedConnection = cached.connections.get(cacheKey);
  if (cachedConnection && cachedConnection.conn) {
    // console.log(`🔄 Reutilizando conexión existente a DB Principal: ${dbName}`);
    return cachedConnection.conn;
  }

  // Verificar que existe la URL de conexión base
  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ MONGODB_URI no definida en producción - funciones de DB estarán limitadas');
      return { readyState: 99 } as mongoose.Connection;
    }
    throw new Error(
      '❌ MONGODB_URI no está definida en las variables de entorno.\n' +
      'Crea un archivo .env.local con: MONGODB_URI=mongodb://localhost:27017/canopia'
    );
  }

  // Crear URI específica para la base de datos principal
  // Usamos 'new URL' para parsear de manera segura y no romper
  // el string de conexión (ej. borrando el host si no tiene path)
  let baseUri: string;
  try {
    const parsedUrl = new URL(process.env.MONGODB_URI);
    parsedUrl.pathname = `/${dbName}`;
    baseUri = parsedUrl.toString();
  } catch (error) {
    // Fallback por si la URI no cumple el estándar URL
    baseUri = process.env.MONGODB_URI.replace(/\/[^/]*$/, `/${dbName}`);
  }

  // Si no hay promesa de conexión para esta DB, crear una nueva
  if (!cachedConnection || !cachedConnection.promise) {
    console.log(`🚀 Estableciendo nueva conexión a DB Principal: ${dbName}...`);

    // Configuración de opciones de Mongoose
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 1,
    };

    // Crear nueva instancia de Mongoose para aislar modelos si fuera necesario,
    // aunque en single-db podríamos usar el mongoose global. 
    // Mantenemos instancia separada para consistencia con el código existente.
    const mongooseInstance = new mongoose.Mongoose();

    // Registrar todos los modelos
    registerModels(mongooseInstance);

    const promise = mongooseInstance.connect(baseUri, opts)
      .then(() => {
        console.log(`✅ Conexión a DB Principal ${dbName} establecida exitosamente`);

        // Listeners
        mongooseInstance.connection.on('connected', () => {
          console.log(`🔗 Conectado a DB: ${dbName}`);
        });

        mongooseInstance.connection.on('error', (err) => {
          console.error(`❌ Error de conexión DB ${dbName}:`, err);
        });

        return mongooseInstance.connection;
      })
      .catch((error) => {
        console.error(`💥 Error al conectar a DB ${dbName}:`, error);
        const connCache = cached?.connections.get(cacheKey);
        if (connCache) {
          connCache.promise = null;
        }
        throw error;
      });

    // Guardar la promesa en el cache
    cached.connections.set(cacheKey, {
      conn: null,
      promise: promise
    });
  }

  try {
    const connCache = cached.connections.get(cacheKey);
    if (!connCache || !connCache.promise) {
      throw new Error(`Error interno: conexión no encontrada para ${cacheKey}`);
    }
    connCache.conn = await connCache.promise;
    return connCache.conn;
  } catch (error) {
    const connCache = cached.connections.get(cacheKey);
    if (connCache) {
      connCache.promise = null;
    }
    throw error;
  }
}

/**
 * Función de compatibilidad - conecta a la base de datos global (legacy)
 * Solo para endpoints que no requieren multi-tenancy
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Asegurar que cached esté inicializado
  if (!cached) {
    cached = global.mongoose = {
      connections: new Map(),
      globalConn: { conn: null, promise: null }
    };
  }

  // Si ya existe una conexión global activa, retornarla
  if (cached.globalConn && cached.globalConn.conn) {
    console.log('🔄 Reutilizando conexión global a MongoDB');
    return cached.globalConn.conn;
  }

  // Verificar que existe la URL de conexión
  if (!process.env.MONGODB_URI) {
    // En producción, devolver conexión mock para evitar fallos en build
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ MONGODB_URI no definida en producción - funciones de DB estarán limitadas');
      return cached.globalConn?.conn || { readyState: 99 } as mongoose.Connection;
    }
    throw new Error(
      '❌ MONGODB_URI no está definida en las variables de entorno.\n' +
      'Crea un archivo .env.local con: MONGODB_URI=mongodb://localhost:27017/canopia'
    );
  }

  // Si no hay promesa de conexión global, crear una nueva
  if (!cached.globalConn || !cached.globalConn.promise) {
    console.log('🚀 Estableciendo nueva conexión global a MongoDB...');

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
    cached.globalConn.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ Conexión global a MongoDB establecida exitosamente');
        console.log(`📍 Base de datos: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

        // Configurar listeners para eventos de conexión
        mongoose.connection.on('connected', () => {
          console.log('🔗 Mongoose conectado a MongoDB (global)');
        });

        mongoose.connection.on('error', (err) => {
          console.error('❌ Error de conexión MongoDB (global):', err);
        });

        mongoose.connection.on('disconnected', () => {
          console.log('🔌 Mongoose desconectado de MongoDB (global)');
        });

        return mongoose.connection;
      })
      .catch((error) => {
        console.error('💥 Error al conectar a MongoDB (global):', error);
        if (cached && cached.globalConn) {
          cached.globalConn.promise = null; // Reset de la promesa en caso de error
        }
        throw error;
      });
  }

  try {
    // Esperar a que se resuelva la promesa de conexión
    if (cached.globalConn) {
      cached.globalConn.conn = await cached.globalConn.promise;
      return cached.globalConn.conn;
    } else {
      throw new Error('Error interno: globalConn no está inicializado');
    }
  } catch (error) {
    // Reset en caso de error
    if (cached.globalConn) {
      cached.globalConn.promise = null;
    }
    throw error;
  }
}

/**
 * Desconecta de todas las conexiones MongoDB (útil para testing o cierre de aplicación)
 *
 * @returns {Promise<void>}
 */
export async function disconnectDB(): Promise<void> {
  // Asegurar que cached esté inicializado
  if (!cached) {
    console.log('ℹ️ No hay conexiones para desconectar');
    return;
  }

  // Desconectar conexiones específicas de usuarios
  for (const [key, connCache] of cached.connections.entries()) {
    if (connCache.conn && connCache.conn.readyState !== 0) {
      try {
        await connCache.conn.close();
        console.log(`🔌 Desconectado de DB: ${key}`);
      } catch (error) {
        console.error(`❌ Error desconectando DB ${key}:`, error);
      }
    }
  }
  cached.connections.clear();

  // Desconectar conexión global
  if (cached.globalConn && cached.globalConn.conn && cached.globalConn.conn.readyState !== 0) {
    await cached.globalConn.conn.close();
    cached.globalConn.conn = null;
    cached.globalConn.promise = null;
    console.log('🔌 Desconectado de MongoDB (global)');
  }
}

/**
 * Verifica el estado de la conexión global a MongoDB
 *
 * @returns {string} - Estado actual de la conexión global
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
 * Función principal para obtener conexión a MongoDB (legacy)
 * Esta es la función que debes importar en tus API routes que no requieren multi-tenancy
 *
 * @returns {Promise<mongoose.Connection>} - Conexión activa a MongoDB global
 */
export default connectDB;

/**
 * Información de las bases de datos para debugging
 *
 * @returns {object} - Información detallada de todas las conexiones
 */
export function getDBInfo() {
  const connectionsInfo: Record<string, {
    status: string;
    name?: string;
    host?: string;
    port?: number;
    readyState?: number;
    modelsCompiled: string[];
  }> = {};

  // Si cached no está inicializado, devolver info vacío
  if (!cached) {
    return {
      totalConnections: 0,
      connections: connectionsInfo,
    };
  }

  // Información de conexiones específicas de usuarios
  for (const [key, connCache] of cached.connections.entries()) {
    const conn = connCache.conn;
    connectionsInfo[key] = {
      status: conn ? getConnectionStatusForConn(conn) : 'no_connection',
      name: conn?.name,
      host: conn?.host,
      port: conn?.port,
      readyState: conn?.readyState,
      modelsCompiled: conn ? Object.keys(conn.models) : [],
    };
  }

  // Información de conexión global
  const globalConn = cached.globalConn?.conn;
  connectionsInfo['global'] = {
    status: globalConn ? getConnectionStatusForConn(globalConn) : 'no_connection',
    name: globalConn?.name,
    host: globalConn?.host,
    port: globalConn?.port,
    readyState: globalConn?.readyState,
    modelsCompiled: globalConn ? Object.keys(globalConn.models) : [],
  };

  return {
    totalConnections: cached.connections.size + 1,
    connections: connectionsInfo,
  };
}

/**
 * Helper para obtener estado de una conexión específica
 */
function getConnectionStatusForConn(connection: mongoose.Connection): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  return states[connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Middleware helper para verificar conexión en API routes con multi-tenancy
 *
 * @param handler - Handler de la API route
 * @returns Handler con verificación de conexión y usuario
 */
export function withUserDB<T = Response>(
  handler: (req: Request, userEmail: string, context?: unknown) => Promise<T>
) {
  return async (req: Request, context?: unknown): Promise<T> => {
    try {
      console.log('🔍 withUserDB: Iniciando validación de autenticación...');

      // 🔍 MEJORADO: Extraer token de Authorization header, cookies O header del middleware
      let token = req.headers.get('authorization')?.replace('Bearer ', '') || null;

      // Si no hay token en Authorization, buscar en cookies
      if (!token) {
        const cookies = req.headers.get('cookie');
        if (cookies) {
          const cookiePairs = cookies.split(';').map(c => c.trim());
          for (const pair of cookiePairs) {
            const [name, ...valueParts] = pair.split('=');
            if (name === 'auth-token' && valueParts.length > 0) {
              token = decodeURIComponent(valueParts.join('='));
              break;
            }
          }
        }
      }

      // Si tampoco está en cookies, buscar en el header del middleware
      if (!token) {
        token = req.headers.get('x-auth-token');
      }

      if (!token) {
        // console.error('❌ withUserDB: No se encontró token de autenticación');
        throw new Error('Token de autenticación requerido');
      }

      // console.log('🔑 withUserDB: Token encontrado, validando...');

      // Verificar token JWT
      const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';
      let decoded: { email: string; role: string };

      try {
        decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
      } catch (jwtError) {
        console.error('❌ withUserDB: Error validando JWT:', jwtError);
        throw new Error('Token inválido o expirado');
      }

      if (!decoded.email) {
        console.error('❌ withUserDB: Email faltante en token decodificado');
        throw new Error('Token inválido - email faltante');
      }

      // console.log('✅ withUserDB: Token válido para usuario:', decoded.email);

      // Conectar a la DB del usuario (solo para asegurar que existe y está conectado)
      // La conexión se cachea internamente, así que esto es rápido si ya está conectada
      // console.log('🔗 withUserDB: Asegurando conexión a DB del usuario...');
      const userConnection = await connectToUserDB(decoded.email);

      if (userConnection.readyState === 99) {
        console.error('❌ withUserDB: DB no disponible (readyState: 99)');
        throw new Error('Base de datos no disponible temporalmente');
      }

      // console.log('✅ withUserDB: Conexión asegurada, ejecutando handler...');

      // Ejecutar handler entregando solo request y email.
      // El handler puede llamar a connectToUserDB(email) nuevamente para obtener la conexión
      // de manera síncrona/rápida gracias al cache.
      return await handler(req, decoded.email, context);
    } catch (error) {
      console.error('💥 withUserDB: Error en middleware:', error);

      // Manejo específico de errores de autenticación
      if (error instanceof Error && (
        error.message === 'Token de autenticación requerido' ||
        error.message === 'Token inválido o expirado' ||
        error.message === 'Token inválido - email faltante'
      )) {
        return NextResponse.json(
          {
            success: false,
            error: 'No autorizado',
            message: 'Tu sesión ha expirado o no es válida. Por favor inicia sesión nuevamente.'
          },
          { status: 401 }
        ) as unknown as T;
      }

      throw error;
    }
  };
}

/**
 * Middleware helper para verificar conexión en API routes (legacy)
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
