import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AuthContext from '../components/AuthContext';

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);
  const router = useRouter();

  const handleLogin = async () => {
    if (!correo || !contrasena) return Alert.alert('Error', 'Ingrese correo y contraseña');
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
      <Text style={styles.title}>Bienvenido a NovaVenta</Text>
      <TextInput placeholder="Correo" style={styles.input} value={correo} onChangeText={setCorreo} keyboardType="email-address" autoCapitalize="none" />
      <TextInput placeholder="Contraseña" style={styles.input} value={contrasena} onChangeText={setContrasena} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f7fafc' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: '#111827' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  button: { backgroundColor: '#0ea5a4', padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' }
});
