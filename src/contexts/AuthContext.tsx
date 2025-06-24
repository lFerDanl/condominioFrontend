'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, Usuario, RegistroData, LoginData } from '../services/auth';

interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  isLoading: boolean;
  error: string | null;
  registrar: (datos: RegistroData) => Promise<boolean>;
  login: (datos: LoginData) => Promise<boolean>;
  logout: () => void;
  limpiarError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar si el usuario está autenticado al cargar
  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const token = authService.obtenerToken();
        if (token) {
          const usuarioVerificado = await authService.verificarToken(token);
          setUsuario(usuarioVerificado);
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        authService.eliminarToken();
      } finally {
        setIsLoading(false);
      }
    };

    verificarAutenticacion();
  }, []);

  const registrar = async (datos: RegistroData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const respuesta = await authService.registrarUsuario(datos);
      authService.guardarToken(respuesta.token);
      setUsuario(respuesta.usuario);
      
      return true;
    } catch (error: any) {
      setError(error.message || 'Error al registrar usuario');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (datos: LoginData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const respuesta = await authService.loginUsuario(datos);
      authService.guardarToken(respuesta.token);
      setUsuario(respuesta.usuario);
      
      return true;
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.eliminarToken();
    setUsuario(null);
    setError(null);
  };

  const limpiarError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    usuario,
    estaAutenticado: !!usuario,
    isLoading,
    error,
    registrar,
    login,
    logout,
    limpiarError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
} 