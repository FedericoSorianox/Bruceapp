/**
 * Database Fixtures - Configuraciones y datos para la base de datos en tests
 * Este archivo maneja la preparación y limpieza de datos de prueba
 */

// Tipos para fixtures de prueba basados en los datos existentes
// Estos tipos son más flexibles para acomodar los datos de prueba específicos

/**
 * Tipo para fixtures de usuario con campos de prueba
 */
type UsuarioFixture = {
  _id?: string;
  email: string;
  password: string;
  name?: string; // Campo adicional para datos de prueba
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  [key: string]: unknown;
};

/**
 * Tipo para fixtures de cultivo con campos de prueba
 */
type CultivoFixture = {
  _id?: string;
  nombre: string;
  tipo?: string; // Campo adicional para datos de prueba
  fechaPlantacion?: Date;
  descripcion?: string;
  ubicacion?: string;
  variedad?: string;
  usuarioId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  estado?: string;
  [key: string]: unknown;
};

/**
 * Tipo para fixtures de tarea con campos de prueba
 */
type TareaFixture = {
  _id?: string;
  titulo: string;
  descripcion?: string;
  fechaVencimiento?: Date;
  prioridad?: string;
  estado?: string;
  cultivoId?: string;
  usuarioId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
};

/**
 * Tipo para fixtures de nota con campos de prueba
 */
type NotaFixture = {
  _id?: string;
  titulo: string;
  contenido?: string;
  tipo?: string;
  cultivoId?: string;
  usuarioId?: string;
  fecha?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
};

/**
 * Tipo para fixtures de comentario con campos de prueba
 */
type ComentarioFixture = {
  _id?: string;
  contenido: string;
  cultivoId?: string;
  usuarioId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: unknown;
};

// Tipo genérico para cualquier fixture con _id opcional
type FixtureWithOptionalId = { _id?: string; [key: string]: unknown };

/**
 * Datos de usuario que se insertan antes de cada test
 */
export const userFixtures: UsuarioFixture[] = [
  {
    _id: 'test-user-1',
    email: 'test@bruceapp.com',
    password: '$2b$10$hashedPassword123', // Password hasheado para 'password123'
    name: 'Usuario Test',
    role: 'user',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    subscriptionStatus: 'active'
  },
  {
    _id: 'admin-user-1',
    email: 'admin@bruceapp.com',
    password: '$2b$10$hashedAdminPassword123', // Password hasheado para 'admin123'
    name: 'Admin Test',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    subscriptionStatus: 'active'
  }
];

/**
 * Datos de cultivos que se insertan antes de cada test
 */
export const cultivoFixtures: CultivoFixture[] = [
  {
    _id: 'cultivo-1',
    nombre: 'Tomate Cherry',
    tipo: 'Hortaliza',
    fechaPlantacion: new Date('2024-01-15'),
    descripcion: 'Cultivo de tomates cherry en maceta',
    ubicacion: 'Balcón',
    variedad: 'Cherry',
    usuarioId: 'test-user-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    estado: 'activo'
  },
  {
    _id: 'cultivo-2',
    nombre: 'Lechuga Romana',
    tipo: 'Verdura',
    fechaPlantacion: new Date('2024-01-20'),
    descripcion: 'Lechuga romana para ensaladas',
    ubicacion: 'Huerto',
    variedad: 'Romana',
    usuarioId: 'test-user-1',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    estado: 'activo'
  }
];

/**
 * Datos de tareas que se insertan antes de cada test
 */
export const tareaFixtures: TareaFixture[] = [
  {
    _id: 'tarea-1',
    titulo: 'Regar tomates',
    descripcion: 'Regar los tomates con agua filtrada',
    fechaVencimiento: new Date('2024-02-01'),
    prioridad: 'media',
    estado: 'pendiente',
    cultivoId: 'cultivo-1',
    usuarioId: 'test-user-1',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    _id: 'tarea-2',
    titulo: 'Fertilizar lechugas',
    descripcion: 'Aplicar fertilizante orgánico',
    fechaVencimiento: new Date('2024-02-05'),
    prioridad: 'alta',
    estado: 'pendiente',
    cultivoId: 'cultivo-2',
    usuarioId: 'test-user-1',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

/**
 * Datos de notas que se insertan antes de cada test
 */
export const notaFixtures: NotaFixture[] = [
  {
    _id: 'nota-1',
    titulo: 'Observación del crecimiento',
    contenido: 'Los tomates están creciendo muy bien, las hojas se ven saludables',
    tipo: 'observacion',
    cultivoId: 'cultivo-1',
    usuarioId: 'test-user-1',
    fecha: new Date('2024-01-25'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    _id: 'nota-2',
    titulo: 'Recordatorio de fertilización',
    contenido: 'Recordar fertilizar las plantas la próxima semana',
    tipo: 'recordatorio',
    cultivoId: 'cultivo-2',
    usuarioId: 'test-user-1',
    fecha: new Date('2024-01-30'),
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30')
  }
];

/**
 * Datos de comentarios que se insertan antes de cada test
 */
export const comentarioFixtures: ComentarioFixture[] = [
  {
    _id: 'comentario-1',
    contenido: 'Excelente cultivo de tomates',
    cultivoId: 'cultivo-1',
    usuarioId: 'test-user-1',
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26')
  }
];

/**
 * Función helper para obtener todos los fixtures combinados
 */
export const getAllFixtures = () => ({
  usuarios: userFixtures,
  cultivos: cultivoFixtures,
  tareas: tareaFixtures,
  notas: notaFixtures,
  comentarios: comentarioFixtures
});

/**
 * Función helper para limpiar IDs de fixtures (útil para insertar nuevos registros)
 * Remueve el campo _id de cada fixture para permitir la inserción de nuevos registros
 * 
 * @param fixtures - Array de fixtures con _id opcional
 * @returns Array de fixtures sin el campo _id
 */
export const cleanFixtureIds = <T extends FixtureWithOptionalId>(fixtures: T[]): Omit<T, '_id'>[] => {
  return fixtures.map(fixture => {
    // Destructuring para separar _id del resto de propiedades
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, ...cleanFixture } = fixture;
    return cleanFixture;
  });
};
