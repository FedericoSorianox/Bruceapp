# 🚀 **GUÍA COMPLETA: Solucionar Deployment en Render**

## 🔧 **TEMPLATE DE VARIABLES DE ENTORNO**

Copia estas variables y configúralas en el dashboard de Render:

```bash
# ===== VARIABLES REQUERIDAS (CRÍTICAS) =====
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/bruceapp
OPENAI_API_KEY=sk-tu-api-key-de-openai-aqui
JWT_SECRET=tu-jwt-secret-super-secreto-aqui
NODE_ENV=production
PORT=3000

# ===== VARIABLES OPCIONALES =====
NEXT_PUBLIC_API_URL=https://tu-app-name.onrender.com
LOG_LEVEL=info
```

---

## 📋 **PASOS PARA SOLUCIONAR EL DEPLOYMENT**

### **PASO 1: Configurar Base de Datos MongoDB**

1. **Crear cuenta en MongoDB Atlas** (gratis):
   - Ve a: https://www.mongodb.com/atlas
   - Crea un cluster gratuito
   - Obtén la cadena de conexión

2. **Configurar MongoDB Atlas**:
   ```
   - Crear usuario de base de datos
   - Permitir acceso desde cualquier IP (0.0.0.0/0)
   - Obtener connection string: mongodb+srv://...
   ```

### **PASO 2: Obtener API Key de OpenAI**

1. Ve a: https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala (comienza con "sk-")

### **PASO 3: Generar JWT Secret**

En tu terminal ejecuta:
```bash
openssl rand -base64 32
```

### **PASO 4: Configurar en Render Dashboard**

1. **Ve a tu proyecto en Render**
2. **Settings → Environment**
3. **Agrega estas variables** (una por una):

```
MONGODB_URI = tu-mongodb-connection-string
OPENAI_API_KEY = tu-openai-api-key
JWT_SECRET = tu-jwt-secret-generado
NODE_ENV = production
PORT = 3000
```

### **PASO 5: Verificar Configuración de Build**

En Render Settings:
```
Build Command: npm run build
Start Command: npm run start
Node Version: 18.x
```

### **PASO 6: Re-deploy**

1. **Manual Deploy** desde el dashboard
2. **Monitor los logs** en tiempo real
3. Buscar errores específicos

---

## 🚨 **ERRORES COMUNES Y SOLUCIONES**

### **Error: "MONGODB_URI is not defined"**
- ✅ **Solución**: Configurar variable MONGODB_URI en Render

### **Error: "Cannot connect to MongoDB"**
- ✅ **Solución**: 
  - Verificar IP whitelist en MongoDB Atlas
  - Verificar usuario/password en connection string

### **Error: "OpenAI API key not provided"**
- ✅ **Solución**: Configurar OPENAI_API_KEY en Render

### **Error: "Build failed"**
- ✅ **Solución**: 
  - Verificar Node.js version (18.x)
  - Verificar que package.json tenga script "build"

---

## 📱 **CÓMO VER LOGS DETALLADOS EN RENDER**

1. **Dashboard → Tu servicio**
2. **Pestaña "Logs"**
3. **Deploy logs** (para errores de build)
4. **Runtime logs** (para errores de ejecución)

Si los logs no aparecen:
- Refresh la página
- Cambiar el filtro de fecha
- Buscar en "Events" también

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

- [ ] MongoDB Atlas configurado y accesible
- [ ] API Key de OpenAI válida
- [ ] JWT Secret generado
- [ ] Variables de entorno configuradas en Render
- [ ] Build command correcto: `npm run build`
- [ ] Start command correcto: `npm run start`
- [ ] Node.js version: 18.x
- [ ] Re-deploy ejecutado

---

## 🆘 **SI SIGUE FALLANDO**

1. **Copia los logs exactos** del deployment
2. **Verifica cada variable** en Render Settings
3. **Prueba build local** con: `npm run build`
4. **Contacta con los logs específicos** para debugging

¡Con estos pasos tu app debería deployar exitosamente! 🚀
