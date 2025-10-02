import { NextRequest, NextResponse } from 'next/server';
import connectDB, { connectToUserDB, getDatabaseName } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import jwt from 'jsonwebtoken';
import { createSubscriptionPreference } from '@/lib/services/mercadopago';

/**
 * 🔐 REGISTRO PÚBLICO - Crea un admin con período de prueba y preferencia de pago
 *
 * Ruta: POST /api/register
 * Body: { email: string, password: string }
 * Respuesta: { success, token, user, database: dbName, requiresPayment, paymentUrl, trialEndsAt }
 *
 * Este endpoint:
 * 1. Crea el usuario en la DB global (para login/verificación)
 * 2. Verifica que no exista un usuario con el mismo email
 * 3. Crea preferencia de pago en MercadoPago
 * 4. Guarda el usuario con período de prueba de 7 días
 * 5. Prepara la base de datos específica del admin
 * 6. Devuelve JWT para autenticación inmediata
 */
const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

export async function POST(request: NextRequest) {
  let globalConnection;

  try {
    // 1. Conectar a la base de datos global para gestión de usuarios
    globalConnection = await connectDB();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // 2. Usar el modelo Usuario con la conexión global
    // Crear un modelo específico para la conexión global
    const UsuarioGlobal = globalConnection.model('Usuario', Usuario.schema);

    // 3. Verificar si ya existe el usuario en la DB global (.usuarios)
    const existente = await UsuarioGlobal.findOne({ email: email.toLowerCase().trim(), activo: true });
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un usuario con este email' },
        { status: 409 }
      );
    }

    // 4. Crear preferencia de pago en MercadoPago
    let preference;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const successUrl = `${baseUrl}/login?status=success`;
      const failureUrl = `${baseUrl}/login?status=failure`;
      const pendingUrl = `${baseUrl}/login?status=pending`;

      preference = await createSubscriptionPreference(
        email.toLowerCase().trim(),
        successUrl,
        failureUrl,
        pendingUrl
      );

      console.log(`✅ Preferencia de MercadoPago creada: ${preference.id}`);
    } catch (mpError) {
      console.warn('⚠️ No se pudo crear preferencia en MercadoPago, registro continúa:', mpError);
    }

    // 5. Crear el usuario en la base de datos global (.usuarios)
    const nuevoUsuario = new UsuarioGlobal({
      email: email.toLowerCase().trim(),
      password,
      role: 'admin',
      activo: true,
      subscriptionStatus: 'trial', // Inicia con período de prueba
      mercadopagoPreferenceId: preference?.id,
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
      exemptFromPayments: false // Por defecto no exento, cambiar manualmente si es necesario
    });

    const guardado = await nuevoUsuario.save();

    // 6. Preparar la base de datos específica del admin
    const dbName = getDatabaseName(guardado.email);
    try {
      // Intentar conectar a la DB del usuario (esto la crea si no existe)
      await connectToUserDB(guardado.email);
      console.log(`✅ Base de datos preparada para admin: ${dbName}`);
    } catch (error) {
      console.warn(`⚠️ No se pudo preparar DB ${dbName}, pero el registro continúa:`, error);
      // No fallar el registro si no se puede crear la DB inmediatamente
    }

    // 4. Generar token JWT
    const tokenPayload = {
      email: guardado.email,
      role: guardado.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60
    };

    const jwtToken = jwt.sign(tokenPayload, JWT_SECRET);

    return NextResponse.json({
      success: true,
      token: jwtToken,
      user: { email: guardado.email, role: guardado.role },
      database: dbName,
      requiresPayment: !!preference?.init_point, // Indica si necesita completar el pago
      paymentUrl: preference?.init_point, // URL para completar el pago
      trialEndsAt: guardado.trialEndDate,
      message: preference?.init_point
        ? `Cuenta creada exitosamente. Tienes 7 días de prueba gratuita.`
        : `Admin registrado exitosamente. Base de datos: ${dbName}`
    });

  } catch (error) {
    console.error('🚨 Error en register:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


