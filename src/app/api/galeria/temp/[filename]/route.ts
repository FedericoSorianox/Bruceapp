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

    // Por ahora, devolver un placeholder
    // En producción, esto debería servir la imagen real desde el almacenamiento
    const placeholderImage = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dy=".3em">
          Imagen: ${filename}
        </text>
        <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle" dy=".3em">
          (Temporal - Implementar almacenamiento real)
        </text>
      </svg>
    `).toString('base64')}`;

    return new NextResponse(placeholderImage, {
      headers: {
        'Content-Type': 'image/svg+xml',
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
