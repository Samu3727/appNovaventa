import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AuthContext from '../../components/AuthContext';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../../config/api';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

export default function Perfil() {
  const { user, signOut, token, setUser } = useContext(AuthContext);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Campos editables
  const [editNombres, setEditNombres] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editContrasena, setEditContrasena] = useState('');
  
  const { alert, alertConfig, hideAlert } = useAlert();

  const loadProfileImage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setProfileImage(`${API_BASE_URL}${data.imageUrl}`);
        }
      }
    } catch (error) {
      console.log('Error al cargar imagen:', error);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadProfileImage();
    }
  }, [user, token]);

  const uploadImage = async (uri) => {
    try {
      setLoading(true);

      // Crear FormData
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri,
        name: filename,
        type
      });

      const response = await fetch(`${API_BASE_URL}/upload/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(`${API_BASE_URL}${data.imageUrl}`);
        Alert.alert('Éxito', 'Imagen actualizada correctamente');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'No se pudo subir la imagen');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const pickImage = async () => {
    // Pedir permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para cambiar tu imagen de perfil');
      return;
    }

    // Abrir selector de imágenes
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    // Pedir permisos de cámara
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu cámara para tomar una foto');
      return;
    }

    // Abrir cámara
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Cambiar foto de perfil',
      'Elige una opción',
      [
        {
          text: 'Tomar foto',
          onPress: takePhoto
        },
        {
          text: 'Elegir de galería',
          onPress: pickImage
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const openEditModal = () => {
    setEditNombres(user.nombres || '');
    setEditApellidos(user.apellidos || '');
    setEditCorreo(user.correo || '');
    setEditTelefono(user.telefono || '');
    setEditContrasena('');
    setEditModalVisible(true);
  };

  const guardarCambios = async () => {
    try {
      setLoading(true);

      const body = {};
      if (editNombres !== user.nombres) body.nombres = editNombres;
      if (editApellidos !== user.apellidos) body.apellidos = editApellidos;
      if (editCorreo !== user.correo) body.correo = editCorreo;
      if (editTelefono !== user.telefono) body.telefono = editTelefono;
      if (editContrasena) body.contrasena = editContrasena;

      if (Object.keys(body).length === 0) {
        alert.warning('Atención', 'No hay cambios para guardar');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.usuario);
        setEditModalVisible(false);
        alert.success('Éxito', 'Perfil actualizado correctamente');
      } else {
        const error = await response.json();
        alert.error('Error', error.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert.error('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {user ? (
          <>
            <View style={styles.card}>
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8} disabled={loading}>
                  {loading ? (
                    <View style={styles.avatar}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  ) : profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {user.nombres?.charAt(0)}{user.apellidos?.charAt(0)}
                      </Text>
                    </View>
                  )}
                  {!loading && (
                    <View style={styles.cameraIconContainer}>
                      <Text style={styles.cameraIcon}>📷</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              
              <Text style={styles.name}>{user.nombres} {user.apellidos}</Text>
              <Text style={styles.email}>{user.correo}</Text>
              
              <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
                <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
              </TouchableOpacity>
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

      {/* Modal de Edición */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Editar Perfil</Text>

              <Text style={styles.label}>Nombres</Text>
              <TextInput
                style={styles.input}
                value={editNombres}
                onChangeText={setEditNombres}
                placeholder="Nombres"
              />

              <Text style={styles.label}>Apellidos</Text>
              <TextInput
                style={styles.input}
                value={editApellidos}
                onChangeText={setEditApellidos}
                placeholder="Apellidos"
              />

              <Text style={styles.label}>Correo</Text>
              <TextInput
                style={styles.input}
                value={editCorreo}
                onChangeText={setEditCorreo}
                placeholder="correo@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={editTelefono}
                onChangeText={setEditTelefono}
                placeholder="Teléfono"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Nueva Contraseña (opcional)</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={editContrasena}
                  onChangeText={setEditContrasena}
                  placeholder="Dejar vacío para no cambiar"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditModalVisible(false)}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={guardarCambios}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
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
    marginBottom: 16,
    position: 'relative'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#10B981'
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff'
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#8B5CF6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  cameraIcon: {
    fontSize: 18
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
  },
  editButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16
  },
  eyeButton: {
    padding: 14
  },
  eyeIcon: {
    fontSize: 20
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600'
  },
  saveButton: {
    backgroundColor: '#8B5CF6'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
