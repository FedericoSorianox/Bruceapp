/**
 * API Route para operaciones en comentarios individuales
 * Maneja GET, PATCH y DELETE para comentarios específicos por ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { ComentarioCultivo, ApiResponseChat } from '@/types/chat';

// Ruta al archivo de base de datos JSON
const DB_PATH = path.join(process.cwd(), 'db.json');

/**
 * Lee la base de datos JSON
 */
async function leerBaseDatos() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al leer base de datos:', error);
    throw new Error('No se pudo acceder a la base de datos');
  }
}

/**
 * Escribe cambios a la base de datos JSON
 */
async function escribirBaseDatos(data: any) {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al escribir base de datos:', error);
    throw new Error('No se pudo guardar en la base de datos');
  }
}

/**
 * GET - Obtener comentario específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await leerBaseDatos();
    
    if (!db.comentarios) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'No se encontraron comentarios'
      }, { status: 404 });
    }

    const comentario = db.comentarios.find((c: ComentarioCultivo) => c.id === params.id);
    
    if (!comentario) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Comentario no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponseChat<ComentarioCultivo>>({
      success: true,
      data: comentario,
      message: 'Comentario encontrado'
    });

  } catch (error) {
    console.error('Error al obtener comentario:', error);
    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error al obtener comentario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * PATCH - Actualizar comentario específico
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const db = await leerBaseDatos();
    
    if (!db.comentarios) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'No se encontraron comentarios'
      }, { status: 404 });
    }

    const comentarioIndex = db.comentarios.findIndex((c: ComentarioCultivo) => c.id === params.id);
    
    if (comentarioIndex === -1) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Comentario no encontrado'
      }, { status: 404 });
    }

    // Actualizar campos específicos
    const comentarioActualizado = {
      ...db.comentarios[comentarioIndex],
      ...body,
      id: params.id, // Prevenir cambio de ID
      fechaActualizacion: new Date().toISOString()
    };

    db.comentarios[comentarioIndex] = comentarioActualizado;
    await escribirBaseDatos(db);

    return NextResponse.json<ApiResponseChat<ComentarioCultivo>>({
      success: true,
      data: comentarioActualizado,
      message: 'Comentario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error al actualizar comentario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * DELETE - Eliminar comentario específico
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await leerBaseDatos();
    
    if (!db.comentarios) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'No se encontraron comentarios'
      }, { status: 404 });
    }

    const comentarioIndex = db.comentarios.findIndex((c: ComentarioCultivo) => c.id === params.id);
    
    if (comentarioIndex === -1) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Comentario no encontrado'
      }, { status: 404 });
    }

    // Eliminar comentario del array
    db.comentarios.splice(comentarioIndex, 1);
    await escribirBaseDatos(db);

    return NextResponse.json<ApiResponseChat>({
      success: true,
      message: 'Comentario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error al eliminar comentario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
