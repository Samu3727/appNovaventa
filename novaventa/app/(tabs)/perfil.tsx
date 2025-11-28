import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthContext from '../../components/AuthContext';
import { useRouter } from 'expo-router';

export default function Perfil() {
  const { user, signOut } = useContext(AuthContext as any);
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.name}>{user.nombres} {user.apellidos}</Text>
          <Text style={styles.email}>{user.correo}</Text>
        </View>
      ) : (
        <Text>No autenticado</Text>
      )}
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  card: { padding: 16, backgroundColor: '#fff', borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  name: { fontSize: 18, fontWeight: '700' },
  email: { color: '#6b7280', marginTop: 6 },
  button: { backgroundColor: '#ef4444', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' }
});
