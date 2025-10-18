// Directiva que indica que este componente se ejecuta en el cliente (no en el servidor)
// Necesario porque usa hooks de estado y eventos del navegador
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Note } from '@/lib/services/notes';

// Definición del tipo Priority que antes estaba en useNotesCrud
export type Priority = 'baja' | 'media' | 'alta';

// Definición de las propiedades que recibe el componente NoteForm
// Todas las props son opcionales excepto onSubmit
type Props = {
  initial?: Partial<Note>; // Valores iniciales para editar una nota existente
  onSubmit: (values: Omit<Note, 'id'>) => Promise<void> | void; // Función que se ejecuta al enviar el formulario
  onCancel?: () => void; // Función opcional para cancelar la edición
  submitLabel?: string; // Texto del botón de envío (por defecto 'Guardar')
};

// Componente principal del formulario de notas
// Maneja tanto la creación como la edición de notas
export default function NoteForm({ initial, onSubmit, onCancel, submitLabel = 'Guardar' }: Props) {
  // Estados para cada campo del formulario, inicializados con valores de 'initial' si existen
  const [title, setTitle] = useState(initial?.title ?? ''); // Título de la nota
  const [content, setContent] = useState(initial?.content ?? ''); // Contenido de la nota
  const [category, setCategory] = useState(initial?.category ?? ''); // Categoría de la nota
  const [tagsInput, setTagsInput] = useState(
    initial?.tags ? initial!.tags!.join(', ') : '' // Tags como string separado por comas
  );
  const [date, setDate] = useState(initial?.date ?? ''); // Fecha de la nota
  const [author, setAuthor] = useState(initial?.author ?? ''); // Autor de la nota
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media'); // Prioridad (baja/media/alta)
  const [hasImages, setHasImages] = useState<boolean>(initial?.hasImages ?? false); // Si tiene imágenes
  const [cropArea, setCropArea] = useState(initial?.cropArea ?? ''); // Área de cultivo relacionada
  const [error, setError] = useState<string | null>(null); // Mensaje de error de validación

  // Calcula si el botón de envío debe estar deshabilitado
  // Se deshabilita si título o contenido están vacíos (después de trim)
  const disabled = useMemo(() => title.trim().length === 0 || content.trim().length === 0, [title, content]);

  // Limpia el mensaje de error cada vez que cambian título o contenido
  // Permite reintentar el envío después de corregir errores
  useEffect(() => setError(null), [title, content]);

  // Manejador del envío del formulario
  // Valida los campos requeridos y prepara los datos para enviar
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Validación: si el formulario está deshabilitado, muestra error
    if (disabled) {
      setError('Título y contenido son obligatorios');
      return;
    }

    // Construye el objeto payload con los datos del formulario
    // Convierte strings vacías a undefined para campos opcionales
    const payload = {
      title: title.trim(), // Título sin espacios en blanco
      content: content.trim(), // Contenido sin espacios en blanco
      category: category || undefined, // Categoría (undefined si está vacía)
      tags: tagsInput // Procesa los tags: separa por coma, limpia espacios, filtra vacíos
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      date: date || undefined, // Fecha (undefined si está vacía)
      author: author || undefined, // Autor (undefined si está vacío)
      priority, // Prioridad (siempre tiene valor por defecto)
      hasImages, // Booleano para indicar si tiene imágenes
      cropArea: cropArea || undefined, // Área de cultivo (undefined si está vacía)
    } satisfies Omit<Note, 'id'>; // Garantiza que cumple con el tipo Note sin el campo id

    // Llama a la función onSubmit pasada como prop
    await onSubmit(payload);
  }

  // Renderiza el formulario con todos los campos de la nota
  return (
    // Formulario con estilos Tailwind: espaciado, bordes redondeados, borde y padding
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border p-4" data-testid="note-form">
      {/* Muestra mensaje de error si existe */}
      {error && <p className="text-sm text-red-600" data-testid="note-form-error">{error}</p>}

      {/* Campo de título - obligatorio */}
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">Título *</label>
        <input
          id="title"
          data-testid="note-form-title"
          className="rounded border p-2"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      {/* Campo de contenido - obligatorio */}
      <div className="grid gap-2">
        <label htmlFor="content" className="text-sm font-medium">Contenido *</label>
        <textarea
          id="content"
          data-testid="note-form-content"
          className="rounded border p-2"
          rows={4}
          value={content}
          onChange={e => setContent(e.target.value)}
        />
      </div>

      {/* Sección de campos opcionales - 2 columnas en pantallas pequeñas y arriba */}
      <div className="grid gap-2 sm:grid-cols-2">
        {/* Campo de categoría */}
        <div className="grid gap-2">
          <label htmlFor="category" className="text-sm font-medium">Categoría</label>
          <input
            id="category"
            data-testid="note-form-category"
            className="rounded border p-2"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
        </div>

        {/* Campo de tags - separados por comas */}
        <div className="grid gap-2">
          <label htmlFor="tags" className="text-sm font-medium">Tags (coma-separados)</label>
          <input
            id="tags"
            data-testid="note-form-tags"
            className="rounded border p-2"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
          />
        </div>
      </div>

      {/* Sección de metadata - 3 columnas en pantallas pequeñas y arriba */}
      <div className="grid gap-2 sm:grid-cols-3">
        {/* Campo de fecha - tipo date para selector nativo */}
        <div className="grid gap-2">
          <label htmlFor="date" className="text-sm font-medium">Fecha</label>
          <input
            id="date"
            data-testid="note-form-date"
            type="date"
            className="rounded border p-2"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        {/* Campo de autor */}
        <div className="grid gap-2">
          <label htmlFor="author" className="text-sm font-medium">Autor</label>
          <input
            id="author"
            data-testid="note-form-author"
            className="rounded border p-2"
            value={author}
            onChange={e => setAuthor(e.target.value)}
          />
        </div>

        {/* Selector de prioridad - baja, media, alta */}
        <div className="grid gap-2">
          <label htmlFor="priority" className="text-sm font-medium">Prioridad</label>
          <select
            id="priority"
            data-testid="note-form-priority"
            className="rounded border p-2"
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
      </div>

      {/* Checkbox para indicar si la nota tiene imágenes */}
      <div className="flex items-center gap-2">
        <input
          id="hasImages"
          data-testid="note-form-has-images"
          type="checkbox"
          checked={hasImages}
          onChange={e => setHasImages(e.target.checked)}
        />
        <label htmlFor="hasImages">Tiene imágenes</label>
      </div>

      {/* Campo de área de cultivo - específico para el contexto agrícola */}
      <div className="grid gap-2">
        <label htmlFor="cropArea" className="text-sm font-medium">Área de cultivo</label>
        <input
          id="cropArea"
          data-testid="note-form-crop-area"
          className="rounded border p-2"
          value={cropArea}
          onChange={e => setCropArea(e.target.value)}
        />
      </div>

      {/* Sección de botones de acción */}
      <div className="flex gap-3 pt-2">
        {/* Botón de envío - deshabilitado si faltan campos requeridos */}
        <button
          type="submit"
          data-testid="note-form-submit"
          disabled={disabled}
          className="rounded-lg border px-3 py-2 disabled:opacity-50"
        >
          {submitLabel}
        </button>

        {/* Botón de cancelar - solo se muestra si se proporciona onCancel */}
        {onCancel && (
          <button
            type="button"
            data-testid="note-form-cancel"
            onClick={onCancel}
            className="rounded-lg border px-3 py-2"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
