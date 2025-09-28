'use client';

/**
 * Componente FormField - Wrapper genérico para campos de formulario
 *
 * Este componente proporciona una estructura consistente para todos los campos
 * de formulario en la aplicación, incluyendo labels, mensajes de error,
 * texto helper, y indicadores de campos requeridos.
 *
 * Uso típico:
 * <FormField label="Nombre" error={errors.name} required>
 *   <input type="text" {...register('name')} />
 * </FormField>
 */

import { ReactNode } from 'react';

/**
 * Props del componente FormField
 * Todas las props son opcionales excepto 'children' que contiene el input/control
 */
type Props = {
  /** Texto del label que se muestra encima del campo */
  label?: string;
  /** Mensaje de error a mostrar (rojo) debajo del campo */
  error?: string | null;
  /** Texto helper explicativo (gris) debajo del campo */
  helper?: string;
  /** El elemento del formulario (input, select, textarea, etc.) */
  children: ReactNode;
  /** Indica si el campo es requerido (muestra asterisco rojo) */
  required?: boolean;
  /** Clases CSS adicionales para personalizar el contenedor */
  className?: string;
};

/**
 * Componente FormField principal
 * Renderiza un campo de formulario completo con todas sus partes opcionales
 *
 * @param props - Todas las propiedades definidas en el tipo Props
 * @returns JSX.Element - El campo de formulario completo
 */
export default function FormField({ label, error, helper, children, required, className }: Props) {
  return (
    // Contenedor principal con layout grid y gap entre elementos
    // Si no se proporciona className, usa 'grid gap-2' por defecto
    <div className={className ?? 'grid gap-2'}>

      {/* Label opcional - solo se renderiza si existe */}
      {/* Incluye asterisco rojo si el campo es requerido */}
      {label && (
        <label className="text-sm font-medium">
          {label}
          {/* Asterisco rojo para campos requeridos */}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {/* Los children (input, select, textarea, etc.) van aquí */}
      {children}

      {/* Texto helper opcional - explicaciones adicionales (gris claro) */}
      {helper && <p className="text-xs text-gray-500">{helper}</p>}

      {/* Mensaje de error opcional - se muestra en rojo cuando hay error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

    </div>
  );
}
