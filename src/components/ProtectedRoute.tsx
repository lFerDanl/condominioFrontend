'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/usuario/login' 
}: ProtectedRouteProps) {
  const { estaAutenticado, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !estaAutenticado) {
      router.push(redirectTo);
    }
  }, [estaAutenticado, isLoading, router, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!estaAutenticado) {
    return null;
  }

  // Si está autenticado, mostrar el contenido
  return <>{children}</>;
} 