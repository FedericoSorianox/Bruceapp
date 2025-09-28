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

- `npm run dev` - Servidor de desarrollo (solo Next.js)
- `npm run dev:full` - Ambos servidores simultáneamente (Next.js + JSON Server)
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run server` - JSON Server para API mock
- `npm run lint` - Verificar calidad de código
- `npm run format` - Formatear código
- `npm run test` - Ejecutar tests

## 🚀 Deployment en Render

Render es una plataforma de cloud que permite desplegar aplicaciones Node.js de forma sencilla y escalable.

### Configuración del Deployment (Web Services Manuales)

1. **Crear cuenta en Render** (si no tienes una):
   - Ve a [render.com](https://render.com) y crea una cuenta gratuita

2. **Crear Web Services separados**:

   **Web Service 1 - API (JSON Server):**
   - En el dashboard de Render, haz clic en "New +" → "Web Service"
   - Conecta tu repositorio GitHub: `https://github.com/FedericoSorianox/Bruceapp`
   - **Nombre**: `bruceapp-api`
   - **Runtime**: Node.js
   - **Build Command**: `echo "Installing json-server dependency"`
   - **Start Command**: `npx json-server --watch db.json --port $PORT --host 0.0.0.0`
   - **Variables de entorno**:
     - `NODE_ENV`: production

   **Web Service 2 - Frontend (Next.js):**
   - Crea un segundo web service con el mismo repositorio
   - **Nombre**: `bruceapp-frontend`
   - **Runtime**: Node.js
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Variables de entorno**:
     - `NODE_ENV`: production
     - `OPENAI_API_KEY`: Tu clave de OpenAI (como secreto)
     - `JWT_SECRET`: Secret seguro para autenticación (como secreto)
     - `NEXT_PUBLIC_API_URL`: URL del servicio API desplegado

3. **Configurar variables de entorno**:
   En cada servicio, configura estas variables en el panel de Render:

   **Para bruceapp-frontend:**
   - `OPENAI_API_KEY`: Tu clave de OpenAI para el chat IA (como secreto)
   - `JWT_SECRET`: Secret seguro para autenticación (como secreto)
   - `NODE_ENV`: production
   - `NEXT_PUBLIC_API_URL`: URL del servicio API desplegado (se actualiza manualmente)

   **Para bruceapp-api:**
   - `NODE_ENV`: production

4. **Deploy**:
   - Render construirá e desplegará automáticamente ambos servicios
   - Una vez completado, tendrás URLs como:
     - Frontend: `https://bruceapp-frontend.onrender.com`
     - API: `https://bruceapp-api.onrender.com`

5. **Configuración de la URL del API**:
   - ⚠️ **IMPORTANTE**: Después de que ambos servicios estén desplegados, necesitas actualizar la variable `NEXT_PUBLIC_API_URL` en el servicio frontend
   - Ve al dashboard de Render, selecciona el servicio frontend
   - Actualiza la variable `NEXT_PUBLIC_API_URL` con la URL real del servicio API desplegado
   - Render redeployará automáticamente el servicio frontend con la nueva configuración

### Configuración Manual en Render Dashboard

Los archivos `render.yaml` y `render-api.yaml` sirven como **referencia** para configurar los web services manualmente:

- **API Service**: Usa la configuración del archivo `render-api.yaml`
- **Frontend Service**: Usa la configuración del archivo `render.yaml`

**Pasos detallados:**
1. Crear el servicio API primero usando la configuración de `render-api.yaml`
2. Una vez desplegado, copia su URL (ej: `https://bruceapp-api-abc123.onrender.com`)
3. Crear el servicio frontend usando la configuración de `render.yaml`
4. En el servicio frontend, configura la variable `NEXT_PUBLIC_API_URL` con la URL del API
5. Configura los secretos `OPENAI_API_KEY` y `JWT_SECRET` en el servicio frontend

### Comandos Locales para Render

```bash
# Construir la aplicación (igual que en Render)
npm run build

# Iniciar aplicación (igual que en Render)
npm start

# Iniciar API (igual que en Render)
npm run server
```

### Notas sobre Render

- **Plan gratuito**: Puedes usar el plan gratuito que incluye 512MB RAM
- **Base de datos**: Actualmente usa JSON Server como mock. Para producción considera:
  - PostgreSQL (disponible en Render)
  - MongoDB Atlas
  - O migrar a una base de datos real
- **Persistencia**: Los archivos subidos se almacenan en el disco persistente configurado
- **Auto-deploy**: Se configura en `render.yaml` como `autoDeploy: false` para control manual

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
├── render.yaml          # Configuración de deployment para Render
└── vercel.json          # Configuración de deployment para Vercel (opcional)
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
