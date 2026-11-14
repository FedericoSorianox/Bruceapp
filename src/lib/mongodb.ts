/**
 * Configuración y conexión unificada a MongoDB con Mongoose
 *
 * Optimizado para rendimiento y simplicidad:
 * - Una única conexión cacheada en global (sin split-brain entre bases de datos)
 * - Registro automático de todos los modelos
 * - Autenticación JWT rápida desde header o cookie
 */

import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Cultivo from '@/lib/models/Cultivo';
import Tarea from '@/lib/models/Tarea';
import Nota from '@/lib/models/Nota';
import Comentario from '@/lib/models/Comentario';
import Usuario from '@/lib/models/Usuario';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    connections: Map<string, { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null }>;
    globalConn: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    connections: new Map(),
    globalConn: { conn: null, promise: null }
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getDatabaseName(_adminEmail?: string): string {
  return 'canopia';
}

export function registerModels(mongooseInstance: mongoose.Mongoose | mongoose.Connection): void {
  const models = mongooseInstance.models;
  if (!models.Cultivo) {
    mongooseInstance.model('Cultivo', Cultivo.schema);
  }
  if (!models.Tarea) {
    mongooseInstance.model('Tarea', Tarea.schema);
  }
  if (!models.Nota) {
    mongooseInstance.model('Nota', Nota.schema);
  }
  if (!models.Comentario) {
    mongooseInstance.model('Comentario', Comentario.schema);
  }
  if (!models.Usuario) {
    mongooseInstance.model('Usuario', Usuario.schema);
  }
}

function createModelForConnection<T extends mongoose.Document = mongoose.Document>(
  baseSchema: mongoose.Schema<T>,
  collectionName: string,
  connection: mongoose.Connection
): mongoose.Model<T> {
  if (connection.models[collectionName]) {
    return connection.models[collectionName] as mongoose.Model<T>;
  }
  return connection.model<T>(collectionName, baseSchema);
}

export function getCultivoModel(connection: mongoose.Connection) {
  return createModelForConnection(Cultivo.schema, 'Cultivo', connection);
}

export function getTareaModel(connection: mongoose.Connection) {
  return createModelForConnection(Tarea.schema, 'Tarea', connection);
}

export function getNotaModel(connection: mongoose.Connection) {
  return createModelForConnection(Nota.schema, 'Nota', connection);
}

export function getComentarioModel(connection: mongoose.Connection) {
  return createModelForConnection(Comentario.schema, 'Comentario', connection);
}

export function getUsuarioModel(connection: mongoose.Connection) {
  return createModelForConnection(Usuario.schema, 'Usuario', connection);
}

/**
 * Conecta a la base de datos unificada (reutilizada tanto por connectDB como por connectToUserDB)
 */
async function connectDB(): Promise<mongoose.Connection> {
  if (!cached) {
    cached = global.mongoose = {
      connections: new Map(),
      globalConn: { conn: null, promise: null }
    };
  }

  if (cached.globalConn && cached.globalConn.conn && cached.globalConn.conn.readyState === 1) {
    registerModels(cached.globalConn.conn);
    return cached.globalConn.conn;
  }

  if (!process.env.MONGODB_URI) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ MONGODB_URI no definida en producción');
      return cached.globalConn?.conn || ({ readyState: 99 } as mongoose.Connection);
    }
    throw new Error(
      '❌ MONGODB_URI no está definida en las variables de entorno.\n' +
      'Crea un archivo .env.local con: MONGODB_URI=mongodb://localhost:27017/canopia'
    );
  }

  if (!cached.globalConn || !cached.globalConn.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      w: 1,
    };

    registerModels(mongoose);

    cached.globalConn.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongooseInstance) => {
        registerModels(mongooseInstance.connection);
        return mongooseInstance.connection;
      })
      .catch((error) => {
        console.error('💥 Error al conectar a MongoDB:', error);
        if (cached && cached.globalConn) {
          cached.globalConn.promise = null;
        }
        throw error;
      });
  }

  try {
    if (cached.globalConn) {
      cached.globalConn.conn = await cached.globalConn.promise;
      return cached.globalConn.conn;
    }
    throw new Error('Error interno: globalConn no está inicializado');
  } catch (error) {
    if (cached.globalConn) {
      cached.globalConn.promise = null;
    }
    throw error;
  }
}

/**
 * Conecta a la DB unificada manteniendo compatibilidad con todos los endpoints que llaman connectToUserDB
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function connectToUserDB(_adminEmail?: string): Promise<mongoose.Connection> {
  return connectDB();
}

export async function disconnectDB(): Promise<void> {
  if (!cached) return;

  for (const [, connCache] of cached.connections.entries()) {
    if (connCache.conn && connCache.conn.readyState !== 0) {
      await connCache.conn.close();
    }
  }
  cached.connections.clear();

  if (cached.globalConn && cached.globalConn.conn && cached.globalConn.conn.readyState !== 0) {
    await cached.globalConn.conn.close();
    cached.globalConn.conn = null;
    cached.globalConn.promise = null;
  }
}

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

export default connectDB;

export function getDBInfo() {
  const globalConn = cached?.globalConn?.conn;
  return {
    totalConnections: globalConn ? 1 : 0,
    connections: {
      global: {
        status: globalConn ? getConnectionStatus() : 'no_connection',
        name: globalConn?.name,
        host: globalConn?.host,
        port: globalConn?.port,
        readyState: globalConn?.readyState,
        modelsCompiled: globalConn ? Object.keys(globalConn.models) : [],
      }
    },
  };
}

/**
 * Middleware helper para verificar conexión y autenticar usuario en API routes
 */
export function withUserDB<T = Response>(
  handler: (req: Request, userEmail: string, context?: unknown) => Promise<T>
) {
  return async (req: Request, context?: unknown): Promise<T> => {
    try {
      let token = req.headers.get('authorization')?.replace('Bearer ', '') || null;

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

      if (!token) {
        token = req.headers.get('x-auth-token');
      }

      if (!token) {
        throw new Error('Token de autenticación requerido');
      }

      const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';
      let decoded: { email: string; role: string };

      try {
        decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
      } catch {
        throw new Error('Token inválido o expirado');
      }

      if (!decoded.email) {
        throw new Error('Token inválido - email faltante');
      }

      const userConnection = await connectToUserDB(decoded.email);
      if (userConnection.readyState === 99) {
        throw new Error('Base de datos no disponible temporalmente');
      }

      return await handler(req, decoded.email, context);
    } catch (error) {
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

export function withDB<T = Response>(
  handler: (req: Request, context?: unknown) => Promise<T>
) {
  return async (req: Request, context?: unknown): Promise<T> => {
    await connectDB();
    return await handler(req, context);
  };
}
