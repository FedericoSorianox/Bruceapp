/**
 * Utilidades para formateo de fechas en la aplicación
 */

/**
 * Formatea una fecha en formato "DD Mes" (ej: "27 Septiembre")
 * @param fechaString - Fecha en formato string (ISO o YYYY-MM-DD)
 * @returns Fecha formateada en español sin año
 */
export const formatearFechaCorta = (fechaString: string): string => {
  if (!fechaString) return 'No disponible';

  try {
    const fecha = new Date(fechaString);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) return 'Fecha inválida';

    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long'
    });
  } catch (error) {
    console.warn('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha completa con hora (ej: "27 Septiembre 2025, 14:30")
 * @param fechaString - Fecha en formato string (ISO)
 * @returns Fecha formateada completa en español
 */
export const formatearFechaCompleta = (fechaString: string): string => {
  if (!fechaString) return 'No disponible';

  try {
    const fecha = new Date(fechaString);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) return 'Fecha inválida';

    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea solo la hora de una fecha (ej: "14:30")
 * @param fechaString - Fecha en formato string (ISO)
 * @returns Hora formateada
 */
export const formatearHora = (fechaString: string): string => {
  if (!fechaString) return '';

  try {
    const fecha = new Date(fechaString);

    // Verificar si la fecha es válida
    if (isNaN(fecha.getTime())) return '';

    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.warn('Error formateando hora:', error);
    return '';
  }
};
