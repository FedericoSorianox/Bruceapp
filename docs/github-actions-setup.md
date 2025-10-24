# GitHub Actions - Setup de Secrets

Para que los tests de Playwright funcionen correctamente en GitHub Actions, necesitas configurar los siguientes secrets en tu repositorio:

## Configuración de Secrets

Ve a tu repositorio en GitHub > Settings > Secrets and variables > Actions > New repository secret

### Secrets requeridos:

1. **TEST_USER_EMAIL**: Email del usuario de test (ej: `test@bruceapp.com`)
2. **TEST_USER_PASSWORD**: Contraseña del usuario de test (ej: `password123`)
3. **ADMIN_USER_EMAIL**: Email del usuario admin de test (ej: `admin@bruceapp.com`)
4. **ADMIN_USER_PASSWORD**: Contraseña del usuario admin de test (ej: `admin123`)
5. **MONGODB_URI**: URI de conexión a MongoDB para testing (ej: `mongodb://localhost:27017/bruceapp_test`)
6. **JWT_SECRET**: Clave secreta para JWT (ej: `bruce-app-test-secret-key-2024`)
7. **RENDER_DEPLOY_HOOK_URL**: URL del webhook de Render para deploy automático

## Mejoras implementadas:

### 1. **Configuración del Web Server**
- Aumentado timeout a 2 minutos en CI
- Agregados pipes para stderr/stdout

### 2. **Setup de Autenticación más robusto**
- Timeout aumentado a 30 segundos
- Mejor manejo de errores
- Logging detallado para debugging
- Soporte para múltiples URLs de redirección (`/cultivo` o `/dashboard`)

### 3. **Health Check Endpoint**
- Nuevo endpoint `/api/health` para verificar que el servidor esté listo
- GitHub Actions espera a que el servidor responda antes de ejecutar tests

### 4. **Script de Setup de Usuarios**
- Crea automáticamente los usuarios de test en la base de datos
- Se ejecuta antes de los tests para garantizar que las credenciales existan

### 5. **Variables de Entorno en CI**
- Todas las variables necesarias se pasan a los tests
- `NODE_ENV=test` para identificar el entorno de testing

### 6. **Servicio de MongoDB en CI**
- Agregado servicio MongoDB (mongo:5.0) en GitHub Actions
- Los tests ahora tienen acceso a una base de datos MongoDB real

## Debugging

Si los tests siguen fallando, revisa los logs de GitHub Actions para ver:

1. Si el servidor se inició correctamente
2. Si la conexión a MongoDB fue exitosa
3. Si los usuarios de test se crearon correctamente
4. Los logs detallados del proceso de login

El script ahora incluye logging exhaustivo para identificar exactamente dónde falla el proceso.
