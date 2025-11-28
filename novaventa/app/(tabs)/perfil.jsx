import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AuthContext from '../../components/AuthContext';
import { useRouter } from 'expo-router';

export default function Perfil() {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {user ? (
          <>
            <View style={styles.card}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.nombres?.charAt(0)}{user.apellidos?.charAt(0)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.name}>{user.nombres} {user.apellidos}</Text>
              <Text style={styles.email}>{user.correo}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Información de la cuenta</Text>
              
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nombres</Text>
                  <Text style={styles.infoValue}>{user.nombres}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Apellidos</Text>
                  <Text style={styles.infoValue}>{user.apellidos}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Correo</Text>
                  <Text style={styles.infoValue}>{user.correo}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.noUser}>No autenticado</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  content: {
    padding: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  avatarContainer: {
    marginBottom: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff'
  },
  name: { 
    fontSize: 24, 
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  email: { 
    color: '#6B7280',
    fontSize: 16
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 4
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600'
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB'
  },
  logoutButton: { 
    backgroundColor: '#EF4444', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  logoutButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16
  },
  noUser: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 32
  }
});
