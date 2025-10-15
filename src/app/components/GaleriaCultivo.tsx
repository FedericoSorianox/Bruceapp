/**
 * Componente de Galería de Imágenes para Cultivos
 * Permite visualizar, agregar y gestionar las imágenes asociadas a un cultivo específico
 * Incluye funcionalidades de subida, eliminación y vista detallada de imágenes
 */

'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import type { Cultivo, ImagenCultivo } from '@/types/cultivo';
import { subirImagenGaleria } from '../../lib/services/galeria';
import { formatearFechaCorta } from '@/lib/utils/date';

/**
 * Props del componente GaleriaCultivo
 */
interface GaleriaCultivoProps {
  /** Datos completos del cultivo */
  cultivo: Cultivo;
  /** Función para actualizar el cultivo cuando se modifica la galería */
  onActualizarCultivo: (cultivo: Cultivo) => void;
  /** Clase CSS adicional para el contenedor */
  className?: string;
}

/**
 * Interfaz para los archivos en proceso de subida
 */
interface ArchivoSubida {
  id: string;
  file: File;
  preview: string;
  progreso: number;
  error?: string;
}

/**
 * Componente principal de galería de imágenes del cultivo
 * Maneja la visualización, carga y gestión de imágenes
 */
const GaleriaCultivo: React.FC<GaleriaCultivoProps> = ({ 
  cultivo, 
  onActualizarCultivo,
  className = '' 
}) => {
  // Estados locales
  const [imagenSeleccionada, setImagenSeleccionada] = useState<ImagenCultivo | null>(null);
  const [archivosSubiendo, setArchivosSubiendo] = useState<ArchivoSubida[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mostrarVistaDetalle, setMostrarVistaDetalle] = useState(false);

  // Referencias
  const inputFileRef = useRef<HTMLInputElement>(null);

  // Obtener imágenes de la galería del cultivo
  const imagenes = cultivo.galeria || [];

  /**
   * Genera un ID único para nuevas imágenes
   */
  const generarIdImagen = (): string => {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Convierte un archivo en base64 solo para preview (no para almacenamiento)
   */
  const convertirArchivoABase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Simula la subida de un archivo y actualiza el progreso
   * En una aplicación real, esto haría la petición al servidor
   */
  const subirArchivoCloudinary = async (archivo: ArchivoSubida): Promise<ImagenCultivo> => {
    for (let progreso = 0; progreso <= 100; progreso += 20) {
      setArchivosSubiendo(prev =>
        prev.map(a => (a.id === archivo.id ? { ...a, progreso } : a))
      );
      await new Promise(resolve => setTimeout(resolve, 80));
    }

    const respuestaCloudinary = await subirImagenGaleria(archivo.file);

    const nuevaImagen: ImagenCultivo = {
      id: generarIdImagen(),
      url: respuestaCloudinary.secureUrl,
      nombre: archivo.file.name.split('.')[0],
      descripcion: '',
      fechaSubida: new Date().toISOString().split('T')[0],
      tamaño: archivo.file.size,
      tipo: archivo.file.type,
    };

    return nuevaImagen;
  };

  /**
   * Maneja la selección de archivos para subir
   */
  const handleSeleccionArchivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);

    // Validar archivos
    const archivosValidos: ArchivoSubida[] = [];
    
    for (const file of Array.from(files)) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} no es un archivo de imagen válido`);
        continue;
      }

      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} es demasiado grande (máximo 10MB)`);
        continue;
      }

      // Crear preview
      const preview = await convertirArchivoABase64(file);

      archivosValidos.push({
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        progreso: 0,
      });
    }

    if (archivosValidos.length > 0) {
      setArchivosSubiendo(archivosValidos);

      // Procesar cada archivo
      for (const archivo of archivosValidos) {
        try {
          const nuevaImagen = await subirArchivoCloudinary(archivo);
          
          // Actualizar cultivo con la nueva imagen (solo información, no base64)
          const cultivoActualizado = {
            ...cultivo,
            galeria: [...(cultivo.galeria || []), nuevaImagen],
          };
          
          // Solo enviar la información de la galería, no las imágenes completas
          onActualizarCultivo(cultivoActualizado);
        } catch (error) {
          setError(`Error al subir ${archivo.file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Limpiar archivos en proceso
      setArchivosSubiendo([]);
    }

    // Limpiar input
    if (inputFileRef.current) {
      inputFileRef.current.value = '';
    }
  };

  /**
   * Elimina una imagen de la galería
   */
  const handleEliminarImagen = (imagenId: string) => {
    const imagen = imagenes.find(img => img.id === imagenId);
    if (!imagen) return;

    const confirmar = confirm(`¿Estás seguro de que quieres eliminar la imagen "${imagen.nombre}"?`);
    if (confirmar) {
      // Solo actualizar la lista de imágenes, no enviar datos completos
      const galeriaActualizada = imagenes.filter(img => img.id !== imagenId);
      
      // Enviar solo la información de la galería actualizada
      onActualizarCultivo({
        ...cultivo,
        galeria: galeriaActualizada,
      });
      
      // Cerrar vista detalle si es la imagen eliminada
      if (imagenSeleccionada?.id === imagenId) {
        setImagenSeleccionada(null);
        setMostrarVistaDetalle(false);
      }
    }
  };

  /**
   * Actualiza la descripción de una imagen
   */
  const handleActualizarDescripcion = (imagenId: string, nuevaDescripcion: string) => {
    // Solo actualizar la descripción de la imagen específica
    const galeriaActualizada = imagenes.map(img => 
      img.id === imagenId 
        ? { ...img, descripcion: nuevaDescripcion }
        : img
    );
    
    // Enviar solo la información de la galería actualizada
    onActualizarCultivo({
      ...cultivo,
      galeria: galeriaActualizada,
    });
    
    // Actualizar imagen seleccionada si es la misma
    if (imagenSeleccionada?.id === imagenId) {
      setImagenSeleccionada({ ...imagenSeleccionada, descripcion: nuevaDescripcion });
    }
  };

  /**
   * Abre la vista detalle de una imagen
   */
  const handleAbrirDetalle = (imagen: ImagenCultivo) => {
    setImagenSeleccionada(imagen);
    setMostrarVistaDetalle(true);
  };

  /**
   * Cierra la vista detalle
   */
  const handleCerrarDetalle = () => {
    setImagenSeleccionada(null);
    setMostrarVistaDetalle(false);
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 ${className}`}>
      {/* Header de la galería */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Galería del Cultivo</h3>
              <p className="text-gray-600 text-sm">
                {imagenes.length} {imagenes.length === 1 ? 'imagen' : 'imágenes'} • {cultivo.nombre}
              </p>
            </div>
          </div>

          {/* Botón para agregar imágenes */}
          <button
            onClick={() => inputFileRef.current?.click()}
            disabled={archivosSubiendo.length > 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Imágenes
          </button>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Archivos subiendo */}
      {archivosSubiendo.length > 0 && (
        <div className="mx-6 mt-6 space-y-3">
          {archivosSubiendo.map((archivo) => (
            <div key={archivo.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                  <Image
                    src={archivo.preview}
                    alt={archivo.file.name}
                    fill
                    className="object-cover rounded-lg"
                    unoptimized={archivo.preview.startsWith('data:')}
                  />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-medium text-gray-900">{archivo.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-grow bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${archivo.progreso}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{archivo.progreso}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid de imágenes */}
      <div className="p-6">
        {imagenes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 font-medium">No hay imágenes en la galería</p>
            <p className="text-gray-400 text-sm mt-1">
              Haz clic en &quot;Agregar Imágenes&quot; para comenzar a documentar tu cultivo
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {imagenes.map((imagen) => (
              <div key={imagen.id} className="group relative">
                <div 
                  className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => handleAbrirDetalle(imagen)}
                >
                  <Image
                    src={imagen.url}
                    alt={imagen.nombre}
                    fill
                    className="object-cover"
                    unoptimized={imagen.url.startsWith('data:') || imagen.url.includes('/api/galeria/temp/')}
                  />
                </div>
                
                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAbrirDetalle(imagen);
                    }}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    title="Ver detalles"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEliminarImagen(imagen.id);
                    }}
                    className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Eliminar imagen"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Nombre de la imagen */}
                <p className="mt-2 text-xs text-gray-600 truncate">{imagen.nombre}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input file oculto */}
      <input
        ref={inputFileRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleSeleccionArchivos}
        className="hidden"
      />

      {/* Modal de vista detalle */}
      {mostrarVistaDetalle && imagenSeleccionada && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{imagenSeleccionada.nombre}</h3>
              <button
                onClick={handleCerrarDetalle}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex flex-col lg:flex-row max-h-[80vh]">
              {/* Imagen */}
              <div className="flex-shrink-0 bg-gray-100 flex items-center justify-center p-4">
                <div className="relative max-w-full max-h-96 lg:max-h-[60vh] w-full h-96 lg:h-[60vh]">
                  <Image
                    src={imagenSeleccionada.url}
                    alt={imagenSeleccionada.nombre}
                    fill
                    className="object-contain rounded-lg"
                    unoptimized={imagenSeleccionada.url.startsWith('data:') || imagenSeleccionada.url.includes('/api/galeria/temp/')}
                    onError={() => {
                      console.error('Error cargando imagen:', imagenSeleccionada.nombre);
                      // Next.js Image component will handle the fallback automatically
                    }}
                  />
                </div>
              </div>

              {/* Información y controles */}
              <div className="p-6 space-y-4 lg:w-80">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={imagenSeleccionada.descripcion || ''}
                    onChange={(e) => handleActualizarDescripcion(imagenSeleccionada.id, e.target.value)}
                    placeholder="Agrega una descripción a esta imagen..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                  />
                </div>

                {/* Metadatos */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha subida:</span>
                    <span className="text-gray-900">{formatearFechaCorta(imagenSeleccionada.fechaSubida)}</span>
                  </div>
                  {imagenSeleccionada.fechaTomada && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fecha tomada:</span>
                      <span className="text-gray-900">{formatearFechaCorta(imagenSeleccionada.fechaTomada)}</span>
                    </div>
                  )}
                  {imagenSeleccionada.tamaño && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tamaño:</span>
                      <span className="text-gray-900">
                        {(imagenSeleccionada.tamaño / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  {imagenSeleccionada.tipo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="text-gray-900">{imagenSeleccionada.tipo}</span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEliminarImagen(imagenSeleccionada.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar Imagen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaCultivo;
