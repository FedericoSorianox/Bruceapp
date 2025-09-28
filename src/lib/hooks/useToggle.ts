'use client';

/**
 * Hook personalizado useToggle - Gestiona estados booleanos con funciones convenientes
 *
 * Este hook proporciona una forma sencilla de manejar estados booleanos en React,
 * ofreciendo funciones predefinidas para activar, desactivar y alternar el valor.
 *
 * @param initial - Valor inicial del estado booleano (por defecto: false)
 * @returns Objeto con el valor actual y funciones para manipularlo
 */

import { useCallback, useState } from 'react';

export function useToggle(initial = false) {
  // Estado interno que almacena el valor booleano actual
  const [value, setValue] = useState(initial);

  // Función para activar el estado (establecer a true)
  // useCallback asegura que la función no se recree en cada render
  const on = useCallback(() => setValue(true), []);

  // Función para desactivar el estado (establecer a false)
  // useCallback asegura que la función no se recree en cada render
  const off = useCallback(() => setValue(false), []);

  // Función para alternar el estado (invertir el valor actual)
  // useCallback asegura que la función no se recree en cada render
  const toggle = useCallback(() => setValue(v => !v), []);

  // Retorna el valor actual y todas las funciones de control
  // Incluye un alias 'set' para setValue por conveniencia
  return { value, on, off, toggle, set: setValue };
}
