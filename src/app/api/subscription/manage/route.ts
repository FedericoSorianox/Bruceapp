/**
 * Gestionar suscripción del usuario con MercadoPago
 *
 * Rutas:
 * - GET /api/subscription/manage - Obtener estado de suscripción
 * - POST /api/subscription/manage?action=cancel - Cancelar suscripción
 * - POST /api/subscription/manage?action=check-payment - Verificar estado de pago
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Usuario, { UsuarioDocument } from '@/lib/models/Usuario';
import { checkPaymentStatus } from '@/lib/services/mercadopago';

const JWT_SECRET = process.env.JWT_SECRET || 'bruce-app-development-secret-key-2024';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };

    // Buscar usuario
    await connectDB();
    const usuario = await Usuario.findOne({ email: decoded.email, activo: true });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular valores de virtuals manualmente
    const hasActiveSubscription = usuario.exemptFromPayments ||
      (usuario.subscriptionStatus === 'active') ||
      (usuario.subscriptionStatus === 'trial' && usuario.trialEndDate && new Date(usuario.trialEndDate) > new Date());

    const trialExpired = !usuario.exemptFromPayments &&
      usuario.subscriptionStatus === 'trial' &&
      usuario.trialEndDate &&
      new Date(usuario.trialEndDate) <= new Date();

    return NextResponse.json({
      success: true,
      subscription: {
        status: usuario.subscriptionStatus,
        mercadopagoPreferenceId: usuario.mercadopagoPreferenceId,
        startDate: usuario.subscriptionStartDate,
        endDate: usuario.subscriptionEndDate,
        trialEndDate: usuario.trialEndDate,
        lastPaymentDate: usuario.lastPaymentDate,
        hasActiveSubscription,
        trialExpired,
        exemptFromPayments: usuario.exemptFromPayments
      }
    });

  } catch (error) {
    console.error('Error obteniendo estado de suscripción:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: string };

    const { action, paymentId } = await request.json();

    // Buscar usuario
    await connectDB();
    const usuario = await Usuario.findOne({ email: decoded.email, activo: true });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si está exento de pagos
    if (usuario.exemptFromPayments && action !== 'check-payment') {
      return NextResponse.json(
        { success: false, error: 'Usuario exento del sistema de pagos' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'cancel':
        return await handleCancelSubscription(usuario);

      case 'check-payment':
        return await handleCheckPayment(paymentId, usuario);

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error gestionando suscripción:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function handleCancelSubscription(usuario: UsuarioDocument) {
  try {
    // Actualizar estado del usuario a cancelado
    await Usuario.findByIdAndUpdate(usuario._id, {
      subscriptionStatus: 'canceled'
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada exitosamente. Seguirás teniendo acceso hasta el final del período actual.'
    });

  } catch (error) {
    console.error('Error cancelando suscripción:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cancelar suscripción' },
      { status: 500 }
    );
  }
}

async function handleCheckPayment(paymentId: string, usuario: UsuarioDocument) {
  if (!paymentId) {
    return NextResponse.json(
      { success: false, error: 'ID de pago requerido' },
      { status: 400 }
    );
  }

  try {
    const paymentInfo = await checkPaymentStatus(paymentId);

    // Si el pago fue aprobado, actualizar la suscripción
    if (paymentInfo.status === 'approved') {
      await Usuario.findByIdAndUpdate(usuario._id, {
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
        lastPaymentDate: new Date().toISOString(),
        paymentMethod: paymentInfo.payment_method_id
      });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: paymentInfo.id,
        status: paymentInfo.status,
        status_detail: paymentInfo.status_detail,
        payment_method: paymentInfo.payment_method_id,
        amount: paymentInfo.transaction_amount,
        date_approved: paymentInfo.date_approved
      },
      subscriptionUpdated: paymentInfo.status === 'approved'
    });

  } catch (error) {
    console.error('Error verificando pago:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar pago' },
      { status: 500 }
    );
  }
}
