import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext({
  user: null,
  token: null,
  signIn: async (correo, contrasena) => {},
  signOut: () => {},
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (correo, contrasena) => {
    try {
      console.log('Intentando login con:', correo);
      console.log('URL:', `${API_BASE_URL}/auth/login`);
      
      const resp = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, contrasena })
      });
      
      console.log('Respuesta status:', resp.status);
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        console.error('Error del servidor:', err);
        throw new Error(err.message || `Error ${resp.status}: No se pudo iniciar sesión`);
      }
      
      const data = await resp.json();
      console.log('Login exitoso:', data.usuario);
      
      setUser(data.usuario);
      setToken(data.token);
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.usuario));
      
      return data;
    } catch (error) {
      console.error('Error completo en signIn:', error);
      
      if (error.message.includes('Network request failed')) {
        Alert.alert('Error de Conexión', 'No se puede conectar al servidor. Verifica que el backend esté corriendo en puerto 8000');
      } else {
        Alert.alert('Error', error.message || 'No se pudo iniciar sesión');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
