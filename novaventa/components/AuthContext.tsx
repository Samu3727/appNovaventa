import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';

const AuthContext = createContext({
  user: null,
  token: null,
  signIn: async (correo: string, contrasena: string) => {},
  signOut: () => {}
});

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // cargar token desde storage si se desea (AsyncStorage)
  }, []);

  const signIn = async (correo: string, contrasena: string) => {
    try {
      const resp = await fetch('http://10.0.2.2:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.message || 'Error en login');
      }
      const data = await resp.json();
      setUser(data.usuario);
      setToken(data.token);
      return data;
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
