"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

/**
 * Componente para mostrar y gestionar el estado de suscripción
 */
export default function SubscriptionStatus() {
  const { user, checkSubscription, isExemptFromPayments } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bruce_token');
      if (!token) return;

      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Error creando enlace de pago:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si está exento de pagos, mostrar mensaje especial
  if (isExemptFromPayments()) {
    return (
      <div className="rounded-lg border p-4 bg-green-50 border-green-200">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎁</span>
          <div>
            <h3 className="font-semibold text-green-900">
              Acceso Completo
            </h3>
            <p className="text-sm text-green-700">
              Tienes acceso ilimitado a todas las funciones
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusInfo = () => {
    switch (user?.subscriptionStatus) {
      case 'trial':
        return {
          color: 'blue',
          icon: '⏰',
          title: 'Período de Prueba',
          description: user?.trialEndDate
            ? `Expira el ${new Date(user.trialEndDate).toLocaleDateString('es-ES')}`
            : 'Período de prueba activo'
        };

      case 'active':
        return {
          color: 'green',
          icon: '✅',
          title: 'Suscripción Activa',
          description: 'Acceso completo a todas las funciones'
        };

      case 'past_due':
        return {
          color: 'red',
          icon: '⚠️',
          title: 'Pago Pendiente',
          description: 'Actualiza tu método de pago para continuar'
        };

      case 'canceled':
        return {
          color: 'orange',
          icon: '🚫',
          title: 'Suscripción Cancelada',
          description: 'Acceso limitado hasta el final del período'
        };

      default:
        return {
          color: 'gray',
          icon: '❓',
          title: 'Estado Desconocido',
          description: 'Contacta soporte si ves este mensaje'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`rounded-lg border p-4 bg-${statusInfo.color}-50 border-${statusInfo.color}-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{statusInfo.icon}</span>
          <div>
            <h3 className={`font-semibold text-${statusInfo.color}-900`}>
              {statusInfo.title}
            </h3>
            <p className={`text-sm text-${statusInfo.color}-700`}>
              {statusInfo.description}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {(user?.subscriptionStatus === 'trial' || user?.subscriptionStatus === 'canceled') && (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Suscribirse'}
            </button>
          )}
        </div>
      </div>

      {user?.subscriptionStatus === 'trial' && user?.trialExpired && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
          Tu período de prueba ha expirado. Suscríbete para continuar usando la aplicación.
        </div>
      )}
    </div>
  );
}
