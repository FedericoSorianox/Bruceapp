/**
 * Servicio client-side para gestión de galería de cultivos
 * Proporciona utilidades para subir imágenes asociadas a un cultivo
 */
/**
 * Estructura de la respuesta al subir una imagen a la galería
 */
export type RespuestaSubidaGaleria = {
  secureUrl: string;
  publicId: string;
  originalFilename: string;
  bytes: number;
  format: string;
};

/**
 * Error lanzado cuando la imagen seleccionada no es válida
 */
class ImagenGaleriaInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImagenGaleriaInvalidaError';
  }
}

/**
 * Valida que el archivo cumpla con tipo y tamaño permitidos
 * @throws ImagenGaleriaInvalidaError cuando la validación falla
 */
const validarArchivoImagen = (file: File): void => {
  if (!file.type.startsWith('image/')) {
    throw new ImagenGaleriaInvalidaError(`El archivo ${file.name} no es una imagen válida.`);
  }

  const limiteBytes = 10 * 1024 * 1024;
  if (file.size > limiteBytes) {
    throw new ImagenGaleriaInvalidaError(`El archivo ${file.name} supera el límite de 10MB.`);
  }
};

/**
 * Sube una imagen de cultivo a la API de galería
 * @param file - Archivo de imagen seleccionado por el usuario
 * @returns Metadata de la imagen almacenada
 */
export const subirImagenGaleria = async (file: File): Promise<RespuestaSubidaGaleria> => {
  try {
    validarArchivoImagen(file);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/galeria', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const detalle = typeof errorData.error === 'string' ? errorData.error : 'Error desconocido al subir imagen.';
      throw new Error(detalle);
    }

    const data = await response.json();

    if (!data?.success || !data?.data) {
      throw new Error(data?.error || 'La respuesta del servidor no contiene datos válidos.');
    }

    return data.data as RespuestaSubidaGaleria;
  } catch (error) {
    if (error instanceof ImagenGaleriaInvalidaError) {
      throw error;
    }

    console.error('Error al subir imagen de galería:', error);
    throw new Error(error instanceof Error ? error.message : 'No se pudo subir la imagen.');
  }
};
