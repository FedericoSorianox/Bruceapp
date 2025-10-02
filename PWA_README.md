# 🌐 Progressive Web App (PWA) - Bruce App

La aplicación Bruce ha sido configurada como una **Progressive Web App (PWA)** para proporcionar una experiencia de aplicación nativa en navegadores web modernos.

## ✅ Características PWA Implementadas

### 🔧 Configuración Técnica
- **next-pwa**: Plugin de Next.js para PWA con Workbox
- **Service Worker**: Caché automático y funcionamiento offline
- **Manifest**: Metadatos completos para instalación como app
- **Iconos**: Generados automáticamente en tamaños 192x192 y 512x512px

### 📱 Funcionalidades PWA
- **Instalación**: Los usuarios pueden instalar la app desde el navegador
- **Modo Offline**: Funcionamiento básico sin conexión
- **Tema Nativo**: Colores y apariencia adaptada al dispositivo
- **Notificaciones**: Preparado para push notifications (futuro)
- **Splash Screen**: Pantalla de carga nativa en móviles

## 📁 Archivos Generados

```
public/
├── manifest.json          # Metadatos PWA
├── sw.js                  # Service Worker (generado automáticamente)
├── workbox-*.js           # Librería Workbox
├── icon.svg               # Icono fuente vectorial
├── icon-192x192.png       # Icono pequeño para PWA
└── icon-512x512.png       # Icono grande para PWA
```

## 🚀 Cómo Usar

### Desarrollo
```bash
npm run dev          # La PWA se desactiva en desarrollo por defecto
```

### Producción
```bash
npm run build        # Genera service worker y archivos PWA
npm start           # Sirve la aplicación con PWA activa
```

### Regenerar Iconos
Si modificas `public/icon.svg`:
```bash
npm run generate-icons
```

## 🔍 Verificación PWA

### En el Navegador
1. Abre la aplicación en Chrome/Edge
2. Abre DevTools (F12)
3. Ve a **Application** > **Manifest** para verificar configuración
4. Ve a **Application** > **Service Workers** para ver estado

### Lighthouse
- Ejecuta **Lighthouse** en DevTools
- Verifica que pase las métricas PWA

## 🎨 Personalización

### Cambiar Icono
1. Edita `public/icon.svg`
2. Ejecuta `npm run generate-icons`
3. Reconstruye la aplicación

### Modificar Manifest
Edita `public/manifest.json` para cambiar:
- Nombre de la aplicación
- Colores del tema
- Descripción
- Categorías

### Configuración Avanzada
Edita `next.config.js` en la sección `withPWA()`:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,        // Auto-registrar service worker
  skipWaiting: true,     // Actualizar SW inmediatamente
  disable: process.env.NODE_ENV === 'development' // Desactivar en dev
});
```

## 📋 Checklist de Calidad PWA

- [x] Manifest válido y completo
- [x] Iconos en tamaños requeridos
- [x] Service Worker registrado
- [x] HTTPS (requerido para PWA)
- [x] Responsive design
- [x] Tema de color consistente
- [x] Meta tags apropiados
- [x] Build sin errores
- [ ] Offline functionality test
- [ ] Install prompt test
- [ ] Push notifications (futuro)

## 🔮 Próximos Pasos

- Implementar estrategia de cache avanzada
- Agregar push notifications
- Mejorar experiencia offline
- Añadir screenshots al manifest
- Implementar background sync
