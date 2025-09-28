/**
 * API Route para gestión de comentarios/notas de cultivos
 * Permite crear, leer, actualizar y eliminar comentarios específicos por cultivo
 * Los comentarios se almacenan en el archivo db.json junto con los cultivos
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { ComentarioCultivo, FiltrosComentarios, ApiResponseChat, TipoComentario, PrioridadComentario } from '@/types/chat';
import type { Cultivo } from '@/types/cultivo';

// Ruta al archivo de base de datos JSON
const DB_PATH = path.join(process.cwd(), 'db.json');

/**
 * Tipos auxiliares para la estructura de la base de datos
 */
interface Person {
  name: string;
  number: string;
  id: string;
}

interface SampleNote {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  date: string;
  author?: string;
  priority?: string;
  hasImages?: boolean;
  cropArea?: string;
}

/**
 * Estructura de la base de datos JSON
 * Define la estructura mínima necesaria para esta API
 */
interface BaseDatos {
  comentarios?: ComentarioCultivo[];
  cultivos?: Cultivo[];
  sampleNotes?: SampleNote[];
  persons?: Person[];
  [key: string]: unknown; // Permite propiedades adicionales
}

/**
 * Lee la base de datos JSON
 * @returns Datos completos de la base de datos
 */
async function leerBaseDatos(): Promise<BaseDatos> {
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
 * @param data - Datos completos a escribir
 */
async function escribirBaseDatos(data: BaseDatos): Promise<void> {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error al escribir base de datos:', error);
    throw new Error('No se pudo guardar en la base de datos');
  }
}

/**
 * Genera un ID único para nuevos comentarios
 * @returns ID único basado en timestamp
 */
function generarId(): string {
  return Date.now().toString();
}

/**
 * Filtra comentarios según los parámetros especificados
 * @param comentarios - Array de comentarios a filtrar
 * @param filtros - Criterios de filtrado
 * @returns Array de comentarios filtrados
 */
function filtrarComentarios(comentarios: ComentarioCultivo[], filtros: FiltrosComentarios): ComentarioCultivo[] {
  let resultado = [...comentarios];

  // Filtrar por cultivo específico
  if (filtros.cultivoId) {
    resultado = resultado.filter(c => c.cultivoId === filtros.cultivoId);
  }

  // Filtrar por tipo de comentario
  if (filtros.tipo) {
    resultado = resultado.filter(c => c.tipo === filtros.tipo);
  }

  // Filtrar por prioridad
  if (filtros.prioridad) {
    resultado = resultado.filter(c => c.prioridad === filtros.prioridad);
  }

  // Filtrar por autor
  if (filtros.autor) {
    resultado = resultado.filter(c => c.autor.toLowerCase().includes(filtros.autor!.toLowerCase()));
  }


  // Filtrar por rango de fechas
  if (filtros.fechaDesde) {
    resultado = resultado.filter(c => c.fecha >= filtros.fechaDesde!);
  }
  if (filtros.fechaHasta) {
    resultado = resultado.filter(c => c.fecha <= filtros.fechaHasta!);
  }

  // Búsqueda en título y contenido
  if (filtros.q) {
    const query = filtros.q.toLowerCase();
    resultado = resultado.filter(c => 
      c.titulo.toLowerCase().includes(query) || 
      c.contenido.toLowerCase().includes(query) ||
      (c.tags && c.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }

  // Ordenamiento
  if (filtros._sort) {
    const sortField = filtros._sort;
    const sortOrder = filtros._order || 'desc';
    
    resultado.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return 1;
      if (bVal === undefined) return -1;
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  } else {
    // Ordenamiento por defecto: más recientes primero
    resultado.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  // Paginación
  if (filtros._page && filtros._limit) {
    const start = (filtros._page - 1) * filtros._limit;
    const end = start + filtros._limit;
    resultado = resultado.slice(start, end);
  } else if (filtros._limit) {
    resultado = resultado.slice(0, filtros._limit);
  }

  return resultado;
}

/**
 * GET - Obtener comentarios con filtros opcionales
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extraer parámetros de filtrado de la URL
    const filtros: FiltrosComentarios = {
      cultivoId: searchParams.get('cultivoId') || undefined,
      tipo: searchParams.get('tipo') as TipoComentario || undefined,
      prioridad: searchParams.get('prioridad') as PrioridadComentario || undefined,
      autor: searchParams.get('autor') || undefined,
      fechaDesde: searchParams.get('fechaDesde') || undefined,
      fechaHasta: searchParams.get('fechaHasta') || undefined,
      q: searchParams.get('q') || undefined,
      _sort: searchParams.get('_sort') as keyof ComentarioCultivo || undefined,
      _order: searchParams.get('_order') as 'asc' | 'desc' || undefined,
      _page: searchParams.get('_page') ? parseInt(searchParams.get('_page')!) : undefined,
      _limit: searchParams.get('_limit') ? parseInt(searchParams.get('_limit')!) : undefined,
    };

    // Leer base de datos
    const db = await leerBaseDatos();
    
    // Inicializar array de comentarios si no existe
    if (!db.comentarios) {
      db.comentarios = [];
    }

    // Aplicar filtros
    const comentariosFiltrados = filtrarComentarios(db.comentarios, filtros);
    
    return NextResponse.json<ApiResponseChat<ComentarioCultivo[]>>({
      success: true,
      data: comentariosFiltrados,
      message: `${comentariosFiltrados.length} comentarios encontrados`
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error al obtener comentarios',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}

/**
 * POST - Crear nuevo comentario
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    if (!body.cultivoId || !body.titulo || !body.contenido || !body.autor || !body.tipo) {
      return NextResponse.json<ApiResponseChat>({
        success: false,
        error: 'Faltan datos requeridos: cultivoId, titulo, contenido, autor, tipo'
      }, { status: 400 });
    }

    // Crear nuevo comentario con valores por defecto
    const nuevoComentario: ComentarioCultivo = {
      id: generarId(),
      cultivoId: body.cultivoId,
      titulo: body.titulo,
      contenido: body.contenido,
      autor: body.autor,
      tipo: body.tipo,
      prioridad: body.prioridad || 'media',
      fecha: new Date().toISOString(),
      tags: body.tags || [],
      imagenes: body.imagenes || []
    };

    // Leer y actualizar base de datos
    const db = await leerBaseDatos();
    
    if (!db.comentarios) {
      db.comentarios = [];
    }
    
    db.comentarios.push(nuevoComentario);
    await escribirBaseDatos(db);

    return NextResponse.json<ApiResponseChat<ComentarioCultivo>>({
      success: true,
      data: nuevoComentario,
      message: 'Comentario creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json<ApiResponseChat>({
      success: false,
      error: 'Error al crear comentario',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
