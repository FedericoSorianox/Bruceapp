"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useRouter } from 'next/navigation';

/**
 * Página de suscripción requerida
 *
 * Se muestra cuando:
 * - El período de prueba ha expirado
 * - La suscripción está cancelada o en mora
 * - No hay suscripción activa
 * - El usuario no está exento de pagos
 */
export default function SubscriptionRequiredPage() {
  const { user, logout, isExemptFromPayments, hasActiveSubscription } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Redirigir si el usuario ya tiene acceso
  useEffect(() => {
    if (hasActiveSubscription() || isExemptFromPayments()) {
      router.push('/notas');
    }
  }, [hasActiveSubscription, isExemptFromPayments, router]);

  // Crear enlace de pago al cargar la página
  useEffect(() => {
    createPaymentLink();
  }, []);

  const createPaymentLink = async () => {
    try {
      const token = localStorage.getItem('bruce_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentUrl(data.paymentUrl);
      } else {
        console.error('Error creando enlace de pago');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubscribe = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
    } else {
      setLoading(true);
      createPaymentLink().finally(() => setLoading(false));
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getStatusMessage = () => {
    if (!user) return 'Verificando estado de cuenta...';

    switch (user.subscriptionStatus) {
      case 'trial':
        return user.trialExpired
          ? 'Tu período de prueba ha expirado. Suscríbete para continuar.'
          : 'Tu período de prueba está activo, pero parece haber un problema.';
      case 'canceled':
        return 'Tu suscripción ha sido cancelada. Renueva para continuar.';
      case 'past_due':
        return 'Tu pago está pendiente. Actualiza tu método de pago.';
      case 'unpaid':
        return 'Hay un problema con tu suscripción. Contacta soporte.';
      default:
        return 'Se requiere una suscripción activa para continuar.';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Suscripción Requerida
          </h1>
          <p className="text-gray-600 mb-4">
            {getStatusMessage()}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Plan Mensual</p>
            <p className="text-2xl font-bold text-blue-900">USD 9.99<span className="text-sm font-normal">/mes</span></p>
            <p className="text-xs mt-1">Acceso completo a todas las funciones</p>
          </div>
        </div>

        {user?.subscriptionStatus === 'trial' && user?.trialEndDate && user?.trialExpired && (
          <div className="bg-orange-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-orange-800">
              Tu período de prueba expiró el{' '}
              {new Date(user.trialEndDate).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Cargando...' : 'Suscribirse Ahora - USD 9.99/mes'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Pagos procesados de forma segura por MercadoPago</p>
          <p>Cancelar en cualquier momento</p>
        </div>
      </div>
    </main>
  );
}
