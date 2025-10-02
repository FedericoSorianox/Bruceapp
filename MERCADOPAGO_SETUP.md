# Configuración de MercadoPago para Sistema de Pagos

## Resumen del Sistema

Bruce App implementa un sistema de suscripciones con MercadoPago que incluye:
- **Período de prueba gratuito**: 7 días al registrarse
- **Suscripción mensual**: USD 9.99 ($9.99 USD)
- **Pagos seguros**: Procesados por MercadoPago
- **Exención de pagos**: Para usuarios existentes
- **Webhooks automáticos**: Actualización en tiempo real del estado

## Paso 1: Crear cuenta en MercadoPago

### Para Uruguay:
1. Ve a [https://www.mercadopago.com.uy](https://www.mercadopago.com.uy)
2. Regístrate con tu cédula de identidad uruguaya
3. Completa la verificación completa de tu cuenta
4. Activa tu cuenta para recibir pagos

### Verificación requerida:
- **Identidad**: Cédula de identidad o pasaporte
- **Domicilio**: Comprobante de domicilio
- **Cuenta bancaria**: Para recibir pagos
- **Actividad**: Descripción de tu negocio

## Paso 2: Crear aplicación en MercadoPago

### Acceder al panel de desarrolladores:
1. Inicia sesión en MercadoPago
2. Ve a **"Tu negocio" > "Desarrolladores"**
3. Haz clic en **"Crear aplicación"**

### Configurar aplicación:
- **Nombre**: "Bruce App - Sistema de Pagos"
- **Descripción**: "Plataforma de gestión agrícola con pagos mensuales"
- **Sitio web**: `https://tu-dominio.com`
- **URI de redireccionamiento**: `https://tu-dominio.com/api/auth/mercadopago`

### Obtener credenciales:
Después de crear la aplicación, obtén:
- **Access Token** (Producción) - Para procesar pagos reales
- **Public Key** - Para el frontend (opcional)

## Paso 3: Configurar webhooks

### Crear webhook:
1. En tu aplicación, ve a **"Webhooks"**
2. Haz clic en **"Crear webhook"**
3. Configura:
   - **URL**: `https://tu-dominio.com/api/webhooks/mercadopago`
   - **Eventos**: Selecciona `payment`
   - **Modo**: Producción

### Eventos importantes:
- `payment.created`: Pago iniciado
- `payment.updated`: Pago actualizado (aprobado, rechazado, etc.)

## Paso 4: Configurar variables de entorno

Actualiza tu archivo `.env.local`:

```bash
# ===========================================
# CONFIGURACIÓN DE MERCADOPAGO (REQUERIDO)
# ===========================================
# Access Token de MercadoPago (obténlo de tu aplicación)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...

# ===========================================
# CONFIGURACIÓN JWT (REQUERIDO)
# ===========================================
# Genera una clave segura para producción
JWT_SECRET=tu_jwt_secret_seguro_aqui

# ===========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ===========================================
# URL base de tu aplicación (cambia en producción)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
# URL de conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/bruce_app
```

## Paso 5: Marcar usuarios existentes como exentos

Si tienes usuarios registrados antes del sistema de pagos:

```bash
# Ver usuarios existentes
npm run exempt-users -- --list

# Marcar usuario específico como exento
npm run exempt-users -- --email usuario@email.com

# Marcar todos los usuarios existentes como exentos
npm run exempt-users -- --all
```

## Paso 6: Probar el sistema

### Flujo de registro:
1. **Usuario se registra** → Recibe período de prueba de 7 días
2. **Después de 7 días** → Redirección automática a página de pago
3. **Completa pago** → Suscripción activada automáticamente
4. **Webhook procesa** → Estado actualizado en base de datos

### Probar pagos:
MercadoPago ofrece tarjetas de prueba:

| Número | Resultado |
|--------|-----------|
| `5031 4332 1540 6351` | Aprobado |
| `4170 0688 1010 3525` | Rechazado |
| `4509 9535 6623 3704` | Pendiente |

### Códigos de estado MercadoPago:
- `approved`: Pago aprobado
- `rejected`: Pago rechazado
- `in_process`: Pago en proceso
- `cancelled`: Pago cancelado

## Paso 7: Despliegue a producción

### Verificación de cuenta:
Asegúrate de que tu cuenta de MercadoPago esté completamente verificada para:
- Recibir pagos reales
- Procesar transacciones internacionales
- Tener soporte prioritario

### URLs de producción:
```bash
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### Webhook de producción:
- Actualiza la URL del webhook a tu dominio de producción
- Asegúrate de que sea HTTPS

## Gestión de Suscripciones

### Estados de suscripción:
- **trial**: Período de prueba (7 días)
- **active**: Suscripción activa y pagada
- **past_due**: Pago pendiente
- **canceled**: Suscripción cancelada
- **unpaid**: Problemas con el pago

### Renovación automática:
Actualmente el sistema es de **pago único mensual**. Los usuarios deben renovar manualmente cada mes.

### Cancelación:
Los usuarios pueden cancelar desde la página de suscripción requerida o contactándote directamente.

## Métodos de Pago Soportados

MercadoPago en Uruguay soporta:
- **Tarjetas de crédito**: Visa, Mastercard, American Express
- **Tarjetas de débito**: Redbrou, Itaú, etc.
- **Efectivo**: RedPagos, Abitab
- **Transferencias bancarias**
- **Cuenta MercadoPago**

## Costos y Comisiones

### Para vendedores en Uruguay:
- **Comisión**: 3.49% + UYU 2.99 por transacción (para pagos en USD)
- **Sin costos ocultos**
- **Sin contratos forzados**
- **Pagos instantáneos** a tu cuenta bancaria

### Costos adicionales:
- **Retiro a cuenta bancaria**: Gratuito
- **Transferencias entre cuentas MP**: Gratuito
- **Devoluciones**: Comisión del 3.49%

## Solución de Problemas

### Pago no se procesa:
- ✅ Verifica que el Access Token sea correcto
- ✅ Confirma que la aplicación esté en modo producción
- ✅ Revisa que la cuenta esté verificada

### Webhook no llega:
- ✅ Verifica que la URL del webhook sea accesible
- ✅ Confirma que sea HTTPS en producción
- ✅ Revisa logs del servidor

### Usuario no puede pagar:
- ✅ Verifica que MercadoPago esté disponible en Uruguay
- ✅ Confirma que la cuenta del usuario esté verificada
- ✅ Revisa límites de pago por día/mes

## Arquitectura del Sistema

```
Frontend (Next.js)
├── AuthProvider → Verifica suscripción en cada ruta
├── SubscriptionStatus → Muestra estado en dashboard
├── Login/Register → Flujo de registro con período de prueba
└── SubscriptionRequired → Página cuando expira prueba

Backend (API Routes)
├── /api/register → Crea usuario + preferencia MercadoPago
├── /api/subscription/checkout → Nueva sesión de pago
├── /api/subscription/manage → Gestionar suscripción
└── /api/webhooks/mercadopago → Actualiza estados automáticamente

Base de Datos (MongoDB)
└── usuarios
    ├── subscriptionStatus
    ├── mercadopagoPreferenceId
    ├── trialEndDate
    └── exemptFromPayments
```

## Consideraciones de Seguridad

- 🔐 **Nunca expongas** el Access Token
- 🔒 Usa HTTPS en producción
- ✅ Valida webhooks con firma (opcional)
- 🛡️ Implementa rate limiting
- 📊 Monitorea transacciones sospechosas

## Soporte

### MercadoPago Uruguay:
- 📧 soporte@mercadopago.com.uy
- 📞 2902 0290 (línea gratuita)
- 💬 Chat en vivo en la plataforma

### Documentación técnica:
- 📖 [Documentación API](https://www.mercadopago.com.uy/developers)
- 🛠️ [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- 📚 [Guías de integración](https://www.mercadopago.com.uy/developers/guides)

¡Tu sistema de pagos con MercadoPago está listo para recibir pagos de usuarios uruguayos de forma segura y confiable!
