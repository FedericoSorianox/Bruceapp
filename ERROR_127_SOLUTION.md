# 🚨 **SOLUCIÓN ERROR 127: "Command Not Found"**

## 🎯 **¿QUÉ SIGNIFICA ERROR 127?**
El error 127 significa que Render **no puede encontrar el comando** que intentas ejecutar en el Build Command.

**Causas más comunes:**
1. **Node.js no está disponible** en el PATH
2. **Build Command incorrecto** o con sintaxis errónea  
3. **Node version incompatible** con tu aplicación
4. **npm/npx no encontrado** en el sistema

---

## 🔧 **SOLUCIÓN PASO A PASO**

### **PASO 1: VERIFICAR BUILD COMMAND** ⚠️ CRÍTICO

#### 📍 **En Render Dashboard → Settings:**

```bash
# ❌ SI TIENES ALGUNO DE ESTOS (CAMBIAR):
npm ci && npm run build
npm install && npm build  
node build
yarn build

# ✅ USAR EXACTAMENTE ESTO:
npm run build
```

**¿Por qué?**
- Render instala dependencias automáticamente
- `npm ci` puede causar conflictos
- Solo necesitas ejecutar el script de build

---

### **PASO 2: CONFIGURAR NODE.JS VERSION** ⚠️ CRÍTICO

#### 📍 **En Environment Variables, AGREGAR:**

```bash
# VARIABLE NUEVA (si no existe):
KEY: NODE_VERSION  
VALUE: 18.20.4

# VERIFICAR ESTAS EXISTEN:
NODE_ENV = production
NODE_OPTIONS = --max-old-space-size=4096
```

**¿Por qué?**
- Tu package.json especifica Node.js 18+
- Sin NODE_VERSION, Render usa versión default (puede ser incompatible)

---

### **PASO 3: ELIMINAR ARCHIVOS CONFLICTIVOS** ⚠️ IMPORTANTE

Tienes **2 archivos de configuración** que pueden causar conflictos:
- `render.yaml` (para frontend)  
- `render-api.yaml` (para API)

#### 🔍 **¿Cuál servicio estás deployando?**

**Si es SOLO el FRONTEND (Next.js):**
```bash
# Mantener: render.yaml
# Eliminar: render-api.yaml
```

**Si es SOLO la API (json-server):**
```bash
# Mantener: render-api.yaml  
# Eliminar: render.yaml
```

---

### **PASO 4: OBTENER LOGS DETALLADOS**

#### 📍 **Para ver logs completos:**

1. **Dashboard → Tu servicio**
2. **Pestaña "Logs"**
3. **Filtrar por "Deploy logs"**
4. **Scroll hacia arriba** para ver logs completos
5. **Buscar líneas que empiecen con:**
   ```bash
   ==> Building...
   ==> Installing dependencies...
   ==> Running build command...
   ```

#### 📍 **Si no aparecen logs detallados:**

```bash
# Agregar en Environment Variables:
KEY: RENDER_EXTERNAL_HOSTNAME
VALUE: tu-app-name.onrender.com

KEY: DEBUG  
VALUE: *
```

---

### **PASO 5: BUILD COMMAND ALTERNATIVO** 

Si sigue fallando, probar esta secuencia:

```bash
# Build Command alternativo:
npm install --production=false && npm run build

# O si usas yarn:
yarn install && yarn build
```

**¿Por qué funciona?**
- Instala dependencias explícitamente
- `--production=false` incluye devDependencies necesarias para build

---

## 🚨 **CASOS ESPECÍFICOS**

### **Error: "npm: command not found"**
```bash
# Agregar en Environment Variables:
PATH = /opt/render/project/src/node_modules/.bin:/usr/local/bin:/usr/bin:/bin
```

### **Error: "node: command not found"**  
```bash
# Verificar NODE_VERSION esté configurado:
NODE_VERSION = 18.20.4

# Si persiste, usar Node.js runtime explícito:
Runtime = Node.js 18
```

### **Error: "next: command not found"**
```bash
# Build Command con npx:
npx next build

# O instalar Next.js globalmente:
npm install -g next && npm run build
```

---

## ⚡ **SOLUCIÓN RÁPIDA (RECOMENDADA)**

### 📋 **Configuración que FUNCIONA 100%:**

```bash
# En Render Settings:
Runtime: Node.js
Build Command: npm run build  
Start Command: npm run start

# Environment Variables:
NODE_VERSION = 18.20.4
NODE_ENV = production  
NODE_OPTIONS = --max-old-space-size=4096
PATH = /opt/render/project/src/node_modules/.bin:/usr/local/bin:/usr/bin:/bin
```

**Secret Files (si es frontend completo):**
- JWT_SECRET
- MONGODB_URI  
- OPENAI_API_KEY

---

## 🔍 **DEBUGGING AVANZADO**

### **Para obtener información del sistema:**

```bash
# Build Command temporal para debugging:
echo "Node version:" && node --version && echo "NPM version:" && npm --version && echo "PATH:" && echo $PATH && npm run build
```

Este comando te mostrará:
- ✅ Si Node.js está disponible
- ✅ Si npm está disponible  
- ✅ Qué versiones tienes
- ✅ Si el PATH está configurado correctamente

---

## 📞 **SI SIGUE FALLANDO**

1. **Toma screenshot** de:
   - Build Command configurado
   - Environment Variables  
   - Logs completos (scroll hacia arriba)

2. **Información específica a reportar:**
   - ¿Es frontend (Next.js) o API (json-server)?
   - ¿Qué Build Command tienes configurado EXACTAMENTE?
   - ¿Qué línea específica dice antes del error 127?

3. **Soluciones de emergencia:**
   - Crear nuevo servicio en Render desde cero
   - Usar deployment desde GitHub (no manual)
   - Probar con Vercel como alternativa

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

Marca cada punto ANTES de redeploy:

- [ ] **Build Command:** `npm run build` (sin npm ci)
- [ ] **NODE_VERSION:** 18.20.4 configurado
- [ ] **Solo 1 archivo:** render.yaml O render-api.yaml (no ambos)
- [ ] **Secret Files:** Los 3 configurados (si es frontend)
- [ ] **Environment Variables:** NODE_ENV, NODE_OPTIONS, PATH
- [ ] **Logs detallados:** DEBUG=* configurado

**¡Con estos cambios el error 127 debería solucionarse!** 🚀
