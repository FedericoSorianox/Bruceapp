/**
 * Ruta API para gestionar las subidas de imágenes de la galería de cultivos
 * Simula la carga a un proveedor externo generando una URL base64 utilizable inmediatamente
 */
import { NextResponse } from 'next/server';

/**
 * Tamaño máximo permitido para las imágenes (10MB)
 */
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

/**
 * Respuesta estandarizada cuando la carga de imagen es exitosa
 */
type RespuestaApiGaleria = {
  success: true;
  data: {
    secureUrl: string;
    publicId: string;
    originalFilename: string;
    bytes: number;
    format: string;
  };
};

/**
 * Respuesta estandarizada cuando ocurre un error controlado
 */
type RespuestaApiError = {
  success: false;
  error: string;
};

/**
 * Construye una respuesta JSON tipada para errores
 */
const buildErrorResponse = (mensaje: string, status = 400) => {
  const body: RespuestaApiError = {
    success: false,
    error: mensaje,
  };

  return NextResponse.json(body, { status });
};

/**
 * Procesa la subida de imágenes de la galería de cultivos
 * Valida el archivo, lo codifica en base64 y retorna metadatos listos para usar
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const archivo = formData.get('file');

    if (!(archivo instanceof Blob)) {
      return buildErrorResponse('No se recibió ninguna imagen válida para subir.', 400);
    }

    const nombreOriginal = typeof archivo === 'object' && 'name' in archivo && typeof archivo.name === 'string'
      ? archivo.name
      : 'imagen-galeria';

    if (!archivo.type.startsWith('image/')) {
      return buildErrorResponse(`El archivo ${nombreOriginal} no es una imagen válida.`, 415);
    }

    const bytes = archivo.size;
    if (bytes > TAMANO_MAXIMO_BYTES) {
      return buildErrorResponse(`El archivo ${nombreOriginal} supera el límite permitido de 10MB.`, 413);
    }

    const formato = archivo.type.split('/')[1] || 'jpeg';
    const publicId = `local-galeria-${Date.now()}`;
    
    // En lugar de base64, usar una URL placeholder que apunte al archivo temporal
    // En producción, esto debería subirse a un servicio como Cloudinary, AWS S3, etc.
    const secureUrl = `/api/galeria/temp/${publicId}.${formato}`;

    const body: RespuestaApiGaleria = {
      success: true,
      data: {
        secureUrl,
        publicId,
        originalFilename: nombreOriginal,
        bytes,
        format: formato,
      },
    };

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error('Error al procesar la subida de galería:', error);
    return buildErrorResponse('No se pudo procesar la imagen, intenta nuevamente más tarde.', 500);
  }
}
