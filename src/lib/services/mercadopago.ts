/**
 * Servicio de MercadoPago - Manejo de pagos y suscripciones
 *
 * Funcionalidades:
 * - Crear preferencias de pago para suscripciones usando API REST
 * - Verificar estado de pagos
 */

// Configuración de MercadoPago
const baseUrl = 'https://api.mercadopago.com';

// Función para obtener el access token
function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN no está configurada');
  }
  return token;
}

// Precio de la suscripción mensual en USD
const MONTHLY_SUBSCRIPTION_PRICE = 9.99; // $9.99 USD

/**
 * Crear una preferencia de pago para suscripción mensual
 * @param email Email del usuario
 * @param successUrl URL de éxito después del pago
 * @param failureUrl URL de fallo después del pago
 * @param pendingUrl URL de pendiente después del pago
 * @returns Preferencia de pago creada
 */
export async function createSubscriptionPreference(
  email: string,
  successUrl: string,
  failureUrl: string,
  pendingUrl: string
) {
  try {
    const preference = {
      items: [
        {
          title: 'Suscripción Mensual - Bruce App',
          description: 'Acceso completo a todas las funciones de Bruce App',
          quantity: 1,
          currency_id: 'USD',
          unit_price: MONTHLY_SUBSCRIPTION_PRICE,
          category_id: 'services'
        }
      ],
      payer: {
        email: email
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl
      },
      auto_return: 'approved',
      external_reference: `subscription_${email}_${Date.now()}`,
      notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/mercadopago`,
      metadata: {
        subscription_type: 'monthly',
        user_email: email
      }
    };

    const response = await fetch(`${baseUrl}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify(preference)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error creando preferencia de MercadoPago:', error);
    throw new Error('Error al crear preferencia de pago');
  }
}

/**
 * Obtener información de un pago por ID
 * @param paymentId ID del pago
 * @returns Información del pago
 */
export async function getPayment(paymentId: string) {
  try {
    const response = await fetch(`${baseUrl}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    throw new Error('Error al obtener información del pago');
  }
}

/**
 * Verificar el estado de un pago
 * @param paymentId ID del pago
 * @returns Estado del pago
 */
export async function checkPaymentStatus(paymentId: string) {
  try {
    const payment = await getPayment(paymentId);

    return {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
      payment_method_id: payment.payment_method_id,
      transaction_amount: payment.transaction_amount,
      date_approved: payment.date_approved,
      date_created: payment.date_created,
      external_reference: payment.external_reference
    };
  } catch (error) {
    console.error('Error verificando estado del pago:', error);
    throw new Error('Error al verificar estado del pago');
  }
}

/**
 * Crear un enlace de pago directo
 * @param email Email del usuario
 * @returns URL de pago directo
 */
export async function createPaymentLink(email: string) {
  try {
    const preference = await createSubscriptionPreference(
      email,
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?status=success`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?status=failure`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?status=pending`
    );

    return {
      paymentUrl: preference.init_point,
      preferenceId: preference.id,
      externalReference: preference.external_reference
    };
  } catch (error) {
    console.error('Error creando enlace de pago:', error);
    throw new Error('Error al crear enlace de pago');
  }
}
