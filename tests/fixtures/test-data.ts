/**
 * Test Data - Datos de prueba reutilizables
 * Este archivo contiene datos estáticos que se usan en los tests
 */

/**
 * Usuarios de prueba para diferentes escenarios
 */
export const testUsers = {
  validUser: {
    email: 'test@bruceapp.com',
    password: 'password123',
    name: 'Usuario Test',
    id: 'test-user-id'
  },
  adminUser: {
    email: 'admin@bruceapp.com',
    password: 'admin123',
    name: 'Admin Test',
    id: 'admin-user-id',
    role: 'admin'
  },
  invalidUser: {
    email: 'invalid@bruceapp.com',
    password: 'wrongpassword'
  },
  newUser: {
    email: 'newuser@bruceapp.com',
    password: 'newpassword123',
    name: 'Nuevo Usuario'
  }
} as const;

/**
 * Datos de cultivos para testing
 */
export const testCultivos = {
  tomate: {
    nombre: 'Tomate Cherry',
    tipo: 'Hortaliza',
    fechaPlantacion: '2024-01-15',
    descripcion: 'Cultivo de tomates cherry en maceta',
    ubicacion: 'Balcón',
    variedad: 'Cherry'
  },
  lechuga: {
    nombre: 'Lechuga Romana',
    tipo: 'Verdura',
    fechaPlantacion: '2024-01-20',
    descripcion: 'Lechuga romana para ensaladas',
    ubicacion: 'Huerto',
    variedad: 'Romana'
  },
  invalidCultivo: {
    nombre: '', // Nombre vacío para probar validación
    tipo: 'Hortaliza',
    fechaPlantacion: '2024-01-15',
    descripcion: 'Cultivo sin nombre'
  }
} as const;

/**
 * Datos de tareas para testing
 */
export const testTareas = {
  riego: {
    titulo: 'Regar tomates',
    descripcion: 'Regar los tomates con agua filtrada',
    fechaVencimiento: '2024-02-01',
    prioridad: 'media',
    estado: 'pendiente'
  },
  fertilizacion: {
    titulo: 'Fertilizar lechugas',
    descripcion: 'Aplicar fertilizante orgánico',
    fechaVencimiento: '2024-02-05',
    prioridad: 'alta',
    estado: 'pendiente'
  },
  cosecha: {
    titulo: 'Cosechar tomates',
    descripcion: 'Recoger tomates maduros',
    fechaVencimiento: '2024-02-10',
    prioridad: 'alta',
    estado: 'completada'
  }
} as const;

/**
 * Datos de notas para testing
 */
export const testNotas = {
  observacion: {
    titulo: 'Observación del crecimiento',
    contenido: 'Los tomates están creciendo muy bien, las hojas se ven saludables',
    tipo: 'observacion',
    fecha: '2024-01-25'
  },
  recordatorio: {
    titulo: 'Recordatorio de fertilización',
    contenido: 'Recordar fertilizar las plantas la próxima semana',
    tipo: 'recordatorio',
    fecha: '2024-01-30'
  }
} as const;

/**
 * Mensajes de error esperados
 */
export const errorMessages = {
  login: {
    invalidCredentials: 'Credenciales inválidas',
    emailRequired: 'El email es requerido',
    passwordRequired: 'La contraseña es requerida'
  },
  cultivo: {
    nameRequired: 'El nombre del cultivo es requerido',
    typeRequired: 'El tipo de cultivo es requerido',
    dateRequired: 'La fecha de plantación es requerida'
  },
  tarea: {
    titleRequired: 'El título de la tarea es requerido',
    dateRequired: 'La fecha de vencimiento es requerida'
  }
} as const;

/**
 * URLs de la aplicación para testing
 */
export const appUrls = {
  login: '/login',
  register: '/register',
  dashboard: '/',
  cultivos: '/cultivo',
  notas: '/notas',
  admin: '/admin',
  subscriptionRequired: '/subscription-required'
} as const;

/**
 * Configuración de timeouts para tests
 */
export const testTimeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  veryLong: 60000
} as const;
