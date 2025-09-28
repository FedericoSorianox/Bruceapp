# BruceApp - Plataforma de Gestión Agrícola Inteligente

BruceApp es una aplicación full-stack desarrollada con Next.js 14, TypeScript y Tailwind CSS para la gestión inteligente de cultivos y tareas agrícolas. Incluye integración con IA (OpenAI) para asistencia inteligente en la gestión agrícola.

## 🚀 Características Principales

- **Gestión de Cultivos**: Crear, editar y gestionar diferentes tipos de cultivos
- **Sistema de Tareas**: Planificación y seguimiento de tareas agrícolas
- **Galería de Imágenes**: Gestión visual de cultivos y avances
- **Sistema de Notas**: Registro de observaciones y apuntes
- **Chat IA**: Asistente inteligente para consultas agrícolas
- **Autenticación**: Sistema de login seguro
- **Blog**: Sección de noticias y artículos agrícolas
- **Panel Administrativo**: Gestión completa del sistema

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: JSON Server (para desarrollo)
- **Autenticación**: JWT tokens
- **IA**: OpenAI API
- **Testing**: Vitest, Testing Library
- **Calidad de Código**: ESLint, Prettier, Stylelint

## 📦 Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Git

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/FedericoSorianox/Bruceapp.git
cd Bruceapp

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus configuraciones
```

### Variables de Entorno

Crear archivo `.env.local`:

```env
# OpenAI API Key para el chat IA
OPENAI_API_KEY=tu_api_key_aqui

# Configuración de la base de datos (JSON Server)
DB_HOST=localhost
DB_PORT=3002

# JWT Secret para autenticación
JWT_SECRET=tu_jwt_secret_aqui
```

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar JSON Server (API mock) en otra terminal
npm run server

# Abrir http://localhost:3000
```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run server` - JSON Server para API mock
- `npm run lint` - Verificar calidad de código
- `npm run format` - Formatear código
- `npm run test` - Ejecutar tests

## 🚀 Deployment en Vercel

### Configuración Automática

1. **Login en Vercel**:
```bash
npx vercel login
```

2. **Deploy**:
```bash
npx vercel --prod --yes
```

### Configuración Manual

1. Conectar el repositorio en [Vercel Dashboard](https://vercel.com/dashboard)
2. Configurar variables de entorno en el panel de Vercel
3. Deploy automático en cada push a main

### Variables de Entorno en Vercel

- `OPENAI_API_KEY`: Tu clave de OpenAI
- `JWT_SECRET`: Secret para JWT (generar uno seguro)
- `NODE_ENV`: production

## 📁 Estructura del Proyecto

```
bruceapp/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── components/     # Componentes React
│   │   ├── cultivo/        # Páginas de cultivos
│   │   ├── notas/          # Páginas de notas
│   │   ├── login/          # Autenticación
│   │   └── admin/          # Panel administrativo
│   ├── components/         # Componentes compartidos
│   ├── lib/               # Utilidades y configuración
│   │   ├── auth/          # Sistema de autenticación
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Servicios API
│   │   └── utils/         # Utilidades
│   └── types/             # Definiciones TypeScript
├── public/               # Archivos estáticos
├── db.json              # Base de datos mock
└── vercel.json          # Configuración de deployment
```

## 🔒 Autenticación

La aplicación incluye un sistema de autenticación completo:

- Login/logout seguro
- Protección de rutas
- Persistencia de sesión
- JWT tokens

## 🤖 Chat IA

Integración con OpenAI GPT-4 para:
- Consultas sobre cultivos
- Consejos agrícolas
- Análisis de problemas
- Recomendaciones personalizadas

## 📊 API

La aplicación usa JSON Server como API REST mock que incluye endpoints para:

- `/api/cultivos` - Gestión de cultivos
- `/api/tareas` - Gestión de tareas
- `/api/notas` - Gestión de notas
- `/api/comentarios` - Comentarios en cultivos
- `/api/galeria` - Gestión de imágenes
- `/api/chat` - Chat con IA

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests en modo watch
npm run test:watch
```

## 📝 Contribución

1. Fork el proyecto
2. Crear rama para nueva feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y está desarrollado para uso exclusivo.

## 🆘 Soporte

Para soporte técnico o consultas, contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para la gestión agrícola inteligente**
