import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import AuthContext from '../../components/AuthContext';

export default function HomeScreen() {
  const { user } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.title}>NovApp</Text>
          <Text style={styles.subtitle}>Sistema de Gestión de Ventas y Pedidos.</Text>
          {user && (
            <Text style={styles.welcome}>Bienvenida {user.nombres}!</Text>
          )}
        </View>

        <View style={styles.features}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <Text style={styles.featureTitle}>Usuarios</Text>
            <Text style={styles.featureDesc}>Gestiona tus clientes de forma eficiente.</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📦</Text>
            <Text style={styles.featureTitle}>Productos</Text>
            <Text style={styles.featureDesc}>Administra tu inventario.</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛒</Text>
            <Text style={styles.featureTitle}>Pedidos</Text>
            <Text style={styles.featureDesc}>Gestiona tus pedidos.</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👤</Text>
            <Text style={styles.featureTitle}>Perfil</Text>
            <Text style={styles.featureDesc}>Administra tu cuenta</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>Características principales</Text>
          <Text style={styles.infoItem}>✓ Autenticación segura con JWT</Text>
          <Text style={styles.infoItem}>✓ CRUD completo de Usuarios y Productos</Text>
          <Text style={styles.infoItem}>✓ Buscadores en tiempo real</Text>
          <Text style={styles.infoItem}>✓ Soft Delete (eliminación lógica)</Text>
          <Text style={styles.infoItem}>✓ Registro de ventas con múltiples productos</Text>
          <Text style={styles.infoItem}>✓ Interfaz profesional y moderna</Text>
        </View>
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
  hero: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 8
  },
  welcome: {
    fontSize: 16,
    color: '#fff',
    marginTop: 8,
    fontWeight: '600'
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 8
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  featureDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center'
  },
  info: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16
  },
  infoItem: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 10,
    lineHeight: 22
  }
});
