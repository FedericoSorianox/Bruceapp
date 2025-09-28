/**
 * Suite de pruebas para el componente NoteForm
 *
 * Este archivo contiene pruebas end-to-end (E2E) del formulario de notas,
 * verificando el comportamiento completo desde la interacción del usuario
 * hasta el envío de datos.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import NoteForm from '@/components/NoteForm';
import type { Note } from '@/lib/services/notes';

/**
 * Suite de pruebas del componente NoteForm
 *
 * Cubre todos los escenarios de uso del formulario de notas:
 * - Validación de campos obligatorios
 * - Procesamiento correcto de datos de entrada
 * - Funcionalidad de cancelar
 * - Edición de notas existentes
 */
describe('NoteForm', () => {
  /**
   * Prueba 1: Validación de campos obligatorios y estado del botón
   *
   * Verifica que:
   * - El botón de submit esté deshabilitado cuando faltan título o contenido
   * - Se muestre mensaje de error al intentar enviar formulario vacío
   * - El botón se habilite automáticamente al completar los campos requeridos
   * - La función onSubmit NO se llame cuando hay errores de validación
   */
  test('1) botón deshabilitado sin título/contenido, y muestra error al forzar submit', async () => {
    // Configuración del mock de usuario para simular interacciones reales
    const user = userEvent.setup();
    // Mock de la función onSubmit para verificar si se llama
    const onSubmit = vi.fn();

    // Renderizar el componente con configuración básica
    const { container } = render(<NoteForm onSubmit={onSubmit} submitLabel="Crear" />);

    // Verificar que el botón esté inicialmente deshabilitado
    const submitBtn = screen.getByRole('button', { name: /crear/i });
    expect(submitBtn).toBeDisabled();

    // Simular envío directo del formulario (sin usar el botón) para probar validación interna
    // Esto cubre el caso donde el usuario presiona Enter o hay validación en handleSubmit
    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    // Verificar que se muestre el mensaje de error de validación
    expect(screen.getByText(/título y contenido son obligatorios/i)).toBeInTheDocument();
    // Asegurarse de que onSubmit no se haya llamado debido a la validación
    expect(onSubmit).not.toHaveBeenCalled();

    // Completar los campos obligatorios para verificar que el botón se habilita
    await user.type(screen.getByLabelText(/t[ií]tulo/i), 'Nueva nota');
    await user.type(screen.getByLabelText(/contenido/i), 'Detalle de la nota');
    expect(submitBtn).toBeEnabled();
  });

  /**
   * Prueba 2: Procesamiento correcto de datos y envío del payload
   *
   * Verifica que el formulario procese correctamente todos los tipos de datos:
   * - Strings con espacios en blanco (trimming automático)
   * - Tags separados por comas convertidos a array (filtrando vacíos)
   * - Campos booleanos (checkboxes)
   * - Campos de selección (select dropdowns)
   * - Campos de texto normales
   *
   * Esta prueba es crítica para asegurar que los datos se envíen
   * en el formato correcto esperado por la API.
   */
  test('2) envía payload correcto (trimming, tags→array, booleanos y selects)', async () => {
    // Configuración del mock de usuario y función onSubmit
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    // Renderizar formulario vacío para crear nueva nota
    render(<NoteForm onSubmit={onSubmit} submitLabel="Crear" />);

    // Llenar todos los campos con datos de prueba que requieren procesamiento
    // Título y contenido con espacios extra para verificar trimming
    await user.type(screen.getByLabelText(/t[ií]tulo/i), '  Nota E2E  ');           // con espacios
    await user.type(screen.getByLabelText(/contenido/i), '  Contenido  ');

    // Campos de texto normales
    await user.type(screen.getByLabelText(/categor[ií]a/i), 'siembra');
    await user.type(screen.getByLabelText(/autor/i), 'Ana');
    await user.type(screen.getByLabelText(/fecha/i), '2024-03-20');
    await user.type(screen.getByLabelText(/área de cultivo/i), 'Lote A');

    // Tags con formato especial: separados por comas, con espacios y elementos vacíos
    await user.type(screen.getByLabelText(/tags/i), 'uno,  dos , , tres');          // mezcla con vacíos

    // Seleccionar opción del dropdown de prioridad
    await user.selectOptions(screen.getByLabelText(/prioridad/i), 'alta');

    // Activar checkbox de imágenes
    await user.click(screen.getByLabelText(/tiene im[aá]genes/i));

    // Enviar el formulario
    await user.click(screen.getByRole('button', { name: /crear/i }));

    // Verificaciones del payload enviado
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Nota E2E',                      // trimmed - espacios removidos
      content: 'Contenido',                   // trimmed - espacios removidos
      category: 'siembra',
      tags: ['uno', 'dos', 'tres'],          // limpiados - convertidos a array, vacíos filtrados
      author: 'Ana',
      date: '2024-03-20',
      priority: 'alta',
      hasImages: true,                       // checkbox activado
      cropArea: 'Lote A',
    }));
  });

  /**
   * Prueba 3: Funcionalidad del botón cancelar
   *
   * Verifica que:
   * - El botón de cancelar aparezca cuando se proporciona la prop onCancel
   * - Al hacer clic en cancelar, se llame a la función onCancel exactamente una vez
   * - El formulario permita operaciones de cancelación sin afectar otras funcionalidades
   */
  test('3) onCancel se dispara si existe', async () => {
    // Configuración del mock de usuario y función onCancel
    const user = userEvent.setup();
    const onCancel = vi.fn();

    // Renderizar formulario con función onCancel proporcionada
    // Nota: onSubmit se pasa como función vacía ya que no se prueba aquí
    render(<NoteForm onSubmit={() => {}} onCancel={onCancel} submitLabel="Guardar" />);

    // Simular clic en el botón de cancelar
    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    // Verificar que onCancel se haya llamado exactamente una vez
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
  /**
   * Prueba 4: Edición de notas existentes con datos iniciales
   *
   * Verifica el flujo completo de edición de una nota existente:
   * - Los campos se inicialicen correctamente con los valores proporcionados
   * - Los arrays de tags se conviertan a string separado por comas para mostrar
   * - Los cambios se procesen correctamente (trimming, conversión de tipos)
   * - El payload enviado refleje solo los cambios realizados
   *
   * Esta prueba es crucial para el modo de edición del formulario.
   */
  test('4) inicializa con "initial" y envía cambios (tags coma→array, trimming, checkbox)', async () => {
    // Configuración del mock de usuario y función onSubmit
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    // Datos iniciales simulando una nota existente que se va a editar
    // Incluye todos los tipos de campos para verificar conversión correcta
    const initial = {
      id: '999',
      title: 'Editar existente',
      content: 'Texto original',
      category: 'riego',
      tags: ['uno', 'dos'],             // Array de tags (como viene de la API)
      date: '2024-03-12',
      author: 'Carlos',
      priority: 'media',
      hasImages: false,                 // Checkbox inicialmente desactivado
      cropArea: 'Lote B',
    } as Partial<Note>;

    // Renderizar formulario en modo edición con datos iniciales
    render(<NoteForm initial={initial} onSubmit={onSubmit} submitLabel="Actualizar" />);

    // === FASE 1: Verificar que los valores iniciales se carguen correctamente ===
    // Los campos de texto normales deben mostrar los valores directamente
    expect(screen.getByLabelText(/t[ií]tulo/i)).toHaveValue('Editar existente');
    expect(screen.getByLabelText(/contenido/i)).toHaveValue('Texto original');
    expect(screen.getByLabelText(/categor[ií]a/i)).toHaveValue('riego');
    expect(screen.getByLabelText(/fecha/i)).toHaveValue('2024-03-12');
    expect(screen.getByLabelText(/autor/i)).toHaveValue('Carlos');
    expect(screen.getByLabelText(/prioridad/i)).toHaveValue('media');
    expect(screen.getByLabelText(/área de cultivo/i)).toHaveValue('Lote B');

    // Los tags (array) deben convertirse a string separado por comas para mostrar en input
    expect(screen.getByLabelText(/tags/i)).toHaveValue('uno, dos'); // join(', ')

    // El checkbox debe estar inicialmente desactivado
    expect(screen.getByLabelText(/tiene im[aá]genes/i)).not.toBeChecked();

    // === FASE 2: Simular edición de algunos campos ===
    // Cambiar título (con espacios para probar trimming)
    await user.clear(screen.getByLabelText(/t[ií]tulo/i));
    await user.type(screen.getByLabelText(/t[ií]tulo/i), '  Editado  ');

    // Cambiar tags completamente
    await user.clear(screen.getByLabelText(/tags/i));
    await user.type(screen.getByLabelText(/tags/i), 'tres, cuatro');

    // Activar checkbox de imágenes
    await user.click(screen.getByLabelText(/tiene im[aá]genes/i));

    // === FASE 3: Enviar el formulario con los cambios ===
    await user.click(screen.getByRole('button', { name: /actualizar/i }));

    // === FASE 4: Verificar que el payload enviado sea correcto ===
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Editado',                 // trimmed - espacios removidos
      content: 'Texto original',        // sin cambios - mantiene valor original
      category: 'riego',                // sin cambios
      tags: ['tres', 'cuatro'],         // parseados - string a array, con trimming
      date: '2024-03-12',              // sin cambios
      author: 'Carlos',                // sin cambios
      priority: 'media',               // sin cambios
      hasImages: true,                  // cambiado - checkbox activado
      cropArea: 'Lote B',              // sin cambios
    });
  });
  
});
