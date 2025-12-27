/**
 * Crear enlace de pago para suscripción en MercadoPago
 *
 * Ruta: POST /api/subscription/checkout
 * Headers: Authorization: Bearer <token>
 * Respuesta: { paymentUrl: string, preferenceId: string }
 *
 * Este endpoint:
 * 1. Verifica autenticación del usuario
 * 2. Verifica que no esté exento de pagos
 * 3. Crea enlace de pago en MercadoPago
 * 4. Devuelve URL de pago
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { createPaymentLink } from '@/lib/services/mercadopago';

const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };
    } catch {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    // 2. Conectar a DB y buscar usuario
    await connectDB();
    const usuario = await Usuario.findOne({ email: decoded.email, activo: true });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 3. Verificar si ya tiene suscripción activa
    if (usuario.subscriptionStatus === 'active') {
      return NextResponse.json(
        { success: false, error: 'Ya tienes una suscripción activa' },
        { status: 400 }
      );
    }

    // 4. Verificar si está exento de pagos
    if (usuario.exemptFromPayments) {
      return NextResponse.json(
        { success: false, error: 'Usuario exento del sistema de pagos' },
        { status: 400 }
      );
    }

    // 5. Crear enlace de pago en MercadoPago
    const paymentData = await createPaymentLink(usuario.email);

    // 6. Actualizar usuario con el ID de preferencia
    await Usuario.findByIdAndUpdate(usuario._id, {
      mercadopagoPreferenceId: paymentData.preferenceId
    });

    return NextResponse.json({
      success: true,
      paymentUrl: paymentData.paymentUrl,
      preferenceId: paymentData.preferenceId
    });

  } catch (error) {
    console.error('Error creando enlace de pago:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
