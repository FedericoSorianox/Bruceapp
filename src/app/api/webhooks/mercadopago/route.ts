/**
 * Webhook de MercadoPago - Maneja notificaciones de pagos
 *
 * Ruta: POST /api/webhooks/mercadopago
 * Headers: ninguno especial (MercadoPago envía automáticamente)
 *
 * Este endpoint:
 * 1. Recibe notificaciones de MercadoPago
 * 2. Verifica el estado del pago
 * 3. Actualiza la suscripción del usuario si el pago fue aprobado
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { checkPaymentStatus } from '@/lib/services/mercadopago';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📢 Webhook MercadoPago recibido:', JSON.stringify(body, null, 2));

    const { id: paymentId, type, action } = body;

    // Solo procesar notificaciones de pago
    if (type !== 'payment' || action !== 'payment.updated') {
      console.log('⚠️ Tipo de notificación no procesada:', type, action);
      return NextResponse.json({ received: true });
    }

    if (!paymentId) {
      console.log('⚠️ No se recibió ID de pago');
      return NextResponse.json({ received: true });
    }

    // Verificar el estado del pago
    const paymentInfo = await checkPaymentStatus(paymentId);
    console.log('💳 Estado del pago:', paymentInfo.status);

    // Solo procesar pagos aprobados
    if (paymentInfo.status !== 'approved') {
      console.log('⚠️ Pago no aprobado, ignorando notificación');
      return NextResponse.json({ received: true });
    }

    // Extraer email del usuario desde la referencia externa
    const externalReference = paymentInfo.external_reference;
    if (!externalReference || !externalReference.startsWith('subscription_')) {
      console.log('⚠️ Referencia externa inválida:', externalReference);
      return NextResponse.json({ received: true });
    }

    const email = externalReference.split('_')[1];
    if (!email) {
      console.log('⚠️ Email no encontrado en referencia externa');
      return NextResponse.json({ received: true });
    }

    // Conectar a base de datos y actualizar usuario
    await connectDB();

    const usuario = await Usuario.findOne({ email: email.toLowerCase(), activo: true });
    if (!usuario) {
      console.log('⚠️ Usuario no encontrado:', email);
      return NextResponse.json({ received: true });
    }

    // Actualizar suscripción del usuario
    await Usuario.findByIdAndUpdate(usuario._id, {
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date().toISOString(),
      subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días desde ahora
      lastPaymentDate: new Date().toISOString(),
      paymentMethod: paymentInfo.payment_method_id
    });

    console.log('✅ Suscripción activada para usuario:', email);

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('🚨 Error procesando webhook de MercadoPago:', error);
    // En caso de error, devolver 200 para evitar reintentos de MercadoPago
    return NextResponse.json({ received: true });
  }
}
