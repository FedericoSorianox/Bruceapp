/**
 * Endpoint temporal para servir imágenes de galería
 * En producción, esto debería ser reemplazado por un CDN o servicio de almacenamiento
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/galeria/temp/[filename]
 * 
 * Sirve imágenes temporales de la galería
 * En producción, esto debería redirigir a un CDN o servicio de almacenamiento
 */
export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Validar que el filename sea seguro
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { success: false, error: 'Filename inválido' },
        { status: 400 }
      );
    }

    // Crear un placeholder PNG simple (1x1 pixel gris)
    // En producción, esto debería servir la imagen real desde el almacenamiento
    const placeholderPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(placeholderPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
      },
    });
  } catch (error) {
    console.error('Error sirviendo imagen temporal:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
