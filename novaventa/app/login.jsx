import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthContext from '../components/AuthContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!correo || !contrasena) {
      return Alert.alert('Error', 'Ingrese correo y contraseña');
    }
    
    setLoading(true);
    try {
      await signIn(correo, contrasena);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login fallido', err.message || 'Revisar credenciales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>NovaVenta</Text>
        <Text style={styles.subtitle}>Bienvenido de nuevo</Text>
        
        <TextInput 
          placeholder="Correo electrónico" 
          style={styles.input} 
          value={correo} 
          onChangeText={setCorreo} 
          keyboardType="email-address" 
          autoCapitalize="none"
          placeholderTextColor="#9CA3AF"
        />
        
        <View style={styles.passwordContainer}>
          <TextInput 
            placeholder="Contraseña" 
            style={styles.passwordInput} 
            value={contrasena} 
            onChangeText={setContrasena} 
            secureTextEntry={!mostrarPassword}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setMostrarPassword(!mostrarPassword)}
          >
            <Ionicons 
              name={mostrarPassword ? "eye-off" : "eye"} 
              size={24} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 24, 
    backgroundColor: '#F3F4F6' 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  title: { 
    fontSize: 32, 
    fontWeight: '700', 
    marginBottom: 8, 
    textAlign: 'center', 
    color: '#111827' 
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24
  },
  input: { 
    backgroundColor: '#F9FAFB', 
    padding: 14, 
    borderRadius: 12, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    fontSize: 16
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 16
  },
  passwordInput: {
    backgroundColor: '#F9FAFB', 
    padding: 14, 
    paddingRight: 50,
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    fontSize: 16
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 12,
    padding: 4
  },
  button: { 
    backgroundColor: '#10B981', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16
  }
});
