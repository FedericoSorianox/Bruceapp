/**
 * Ruta API para gestionar las subidas de imágenes de la galería de cultivos
 * Sube imágenes directamente a Cloudinary para almacenamiento en la nube
 */
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

/**
 * Tamaño máximo permitido para las imágenes (10MB)
 */
const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024;

/**
 * Configuración de Cloudinary
 * Se configura una sola vez al cargar el módulo
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
 * Valida el archivo y lo sube directamente a Cloudinary
 */
export async function POST(request: Request) {
  try {
    // Verificar que las credenciales de Cloudinary estén configuradas
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Credenciales de Cloudinary no configuradas');
      return buildErrorResponse('Servicio de almacenamiento no configurado. Contacta al administrador.', 500);
    }

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

    // Convertir el archivo a buffer para subir a Cloudinary
    const arrayBuffer = await archivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generar un public_id único para la imagen
    const timestamp = Date.now();
    const publicId = `galeria-cultivos/${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    // Subir imagen a Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: 'galeria-cultivos',
          resource_type: 'image',
          // Optimizaciones automáticas de Cloudinary
          quality: 'auto',
          format: 'auto',
          // Generar diferentes tamaños automáticamente
          eager: [
            { width: 800, height: 600, crop: 'fill' },
            { width: 400, height: 300, crop: 'fill' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Error al subir a Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const body: RespuestaApiGaleria = {
      success: true,
      data: {
        secureUrl: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        originalFilename: nombreOriginal,
        bytes: uploadResult.bytes,
        format: uploadResult.format,
      },
    };

    return NextResponse.json(body, { status: 201 });
  } catch (error) {
    console.error('Error al procesar la subida de galería:', error);

    // Manejar errores específicos de Cloudinary
    if (error && typeof error === 'object' && 'http_code' in error) {
      const cloudinaryError = error as any;
      if (cloudinaryError.http_code === 401) {
        return buildErrorResponse('Credenciales de Cloudinary inválidas.', 500);
      }
      if (cloudinaryError.http_code === 403) {
        return buildErrorResponse('No tienes permisos para subir imágenes.', 403);
      }
      if (cloudinaryError.http_code === 413) {
        return buildErrorResponse('La imagen es demasiado grande para procesar.', 413);
      }
    }

    return buildErrorResponse('No se pudo procesar la imagen, intenta nuevamente más tarde.', 500);
  }
}
