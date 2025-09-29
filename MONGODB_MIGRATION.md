# 🚀 Migración a MongoDB - Bruce App

Esta guía te ayudará a migrar tu aplicación Bruce de JSON Server a MongoDB para producción.

## ✅ ¿Qué se ha migrado?

- ✅ **Esquemas de MongoDB**: Modelos Mongoose con validaciones completas
- ✅ **APIs**: Todas las rutas migradas de JSON Server a MongoDB
- ✅ **Servicios Frontend**: Actualizados para trabajar con las nuevas APIs
- ✅ **Scripts de Migración**: Para transferir datos existentes
- ✅ **Scripts de Inicialización**: Para crear datos de ejemplo

## 📋 Requisitos Previos

### 1. Instalar MongoDB

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
- Descargar desde [mongodb.com](https://www.mongodb.com/try/download/community)
- Instalar y ejecutar como servicio

**Linux (Ubuntu):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### 2. Verificar MongoDB
```bash
# Verificar que MongoDB está ejecutándose
mongosh --eval "db.adminCommand('ismaster')"
```

### 3. Configurar Variables de Entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```bash
# Base de datos local para desarrollo
MONGODB_URI=mongodb://localhost:27017/bruceapp

# Para producción (MongoDB Atlas)
# MONGODB_URI=mongodb+srv://tu-usuario:tu-password@tu-cluster.mongodb.net/bruceapp?retryWrites=true&w=majority

# Configuración de entorno
NODE_ENV=development

# OpenAI Configuration (si la usas)
OPENAI_API_KEY=tu_clave_openai_aqui
```

## 🔄 Proceso de Migración

### Paso 1: Migrar Datos Existentes

Si ya tienes datos en `db.json`, migra todo a MongoDB:

```bash
# Asegúrate de que tu servidor Next.js esté ejecutándose
npm run dev

# En otra terminal, ejecuta la migración
npm run migrate
```

### Paso 2: Verificar la Migración

El script te mostrará un reporte detallado:
```
📊 REPORTE DE MIGRACIÓN
==================================================
✅ Cultivos migrados: 5
✅ Tareas migradas: 12
✅ Notas migradas: 8
✅ Comentarios migrados: 3
✅ Total de registros: 28

🎉 ¡Migración completada sin errores!
```

### Paso 3 (Opcional): Datos de Ejemplo

Si empiezas desde cero o quieres datos de ejemplo:

```bash
npm run seed
```

## 🎯 Nuevas Funcionalidades

### Validaciones Automáticas
- Los esquemas de Mongoose validan automáticamente los datos
- Mensajes de error más descriptivos
- Prevención de datos inconsistentes

### Búsqueda Optimizada
- Búsqueda full-text en MongoDB (más rápida que JSON)
- Índices optimizados para consultas frecuentes
- Filtros y ordenamiento mejorados

### Auditoría Completa
- Registro de quién crea/edita cada registro
- Timestamps automáticos
- Historial de cambios

### Escalabilidad
- Manejo eficiente de miles de registros
- Paginación optimizada
- Conexiones de base de datos gestionadas

## 📂 Nueva Estructura

```
bruceapp/
├── src/lib/
│   ├── mongodb.ts              # Conexión a MongoDB
│   └── models/                 # Modelos Mongoose
│       ├── Cultivo.ts
│       ├── Tarea.ts
│       ├── Nota.ts
│       ├── Comentario.ts
│       ├── MensajeChat.ts
│       └── index.ts
├── scripts/
│   ├── migrate-to-mongodb.js   # Script de migración
│   └── seed-mongodb.js         # Script de datos de ejemplo
└── .env.local                  # Variables de entorno
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo (MongoDB integrado)
npm run dev

# Migración de datos
npm run migrate

# Crear datos de ejemplo
npm run seed

# Reiniciar base de datos
npm run db:reset

# Producción
npm run build
npm start
```

## 🌐 Configuración para Producción

### MongoDB Atlas (Recomendado)

1. **Crear cuenta**: [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

2. **Crear cluster gratuito**:
   - Selecciona región más cercana
   - Configura usuario y contraseña
   - Whitelist tu IP (o 0.0.0.0/0 para todas)

3. **Obtener URL de conexión**:
   ```
   mongodb+srv://usuario:password@cluster.mongodb.net/bruceapp?retryWrites=true&w=majority
   ```

4. **Actualizar variables de entorno**:
   ```bash
   # .env.local (desarrollo)
   MONGODB_URI=mongodb://localhost:27017/bruceapp
   
   # Variables de producción (Vercel/Render)
   MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/bruceapp?retryWrites=true&w=majority
   ```

```

### Render Deployment

Actualiza `render.yaml`:
```yaml
services:
  - type: web
    name: bruce-app
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        value: tu-mongodb-uri-aqui
      - key: NODE_ENV
        value: production
```

## 🔍 Verificación y Testing

### Verificar Conexión
```bash
# En tu aplicación, verifica logs
npm run dev

# Busca estos mensajes:
# ✅ Conexión a MongoDB establecida exitosamente
# 📍 Base de datos: bruceapp
# 🌐 Host: localhost:27017
```

### Probar APIs
```bash
# Listar cultivos
curl http://localhost:3000/api/cultivos

# Crear cultivo (requiere autenticación)
curl -X POST http://localhost:3000/api/cultivos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer fake-admin@bruce.app" \
  -d '{"nombre":"Test Cultivo","activo":true}'
```

## 🚨 Troubleshooting

### Error: "MONGODB_URI no está definida"
- Verifica que existe `.env.local`
- Reinicia el servidor de desarrollo

### Error: "No se pudo conectar a MongoDB"
- Verifica que MongoDB está ejecutándose: `brew services list | grep mongodb`
- Confirma la URL de conexión en `.env.local`

### Error de migración: "Token de autenticación inválido"
- Asegúrate de que el servidor Next.js esté ejecutándose
- El script usa tokens fake para la migración

### Datos no aparecen después de migración
- Verifica logs del script de migración
- Comprueba que las APIs respondan correctamente
- Revisa la consola del navegador por errores

## 📞 Soporte

Si encuentras problemas:

1. **Revisa logs**: Los errores aparecen en la consola
2. **Verifica configuración**: Especialmente variables de entorno
3. **Documenta el error**: Incluye mensajes completos de error
4. **Prueba con datos nuevos**: Usa `npm run seed` para verificar

## 🎉 ¡Listo para Producción!

Una vez completada la migración:

- ✅ Tu aplicación usa MongoDB como base de datos principal
- ✅ Mejor performance y escalabilidad
- ✅ Validaciones automáticas de datos
- ✅ Auditoría completa de cambios
- ✅ Búsqueda optimizada
- ✅ Lista para deploy en producción

¡Felicidades! Tu aplicación Bruce ahora está optimizada para producción con MongoDB. 🚀
