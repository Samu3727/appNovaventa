import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AuthContext from '../../components/AuthContext';
import { API_BASE_URL } from '../../config/api';

export default function ProductosTab() {
  const [productos, setProductos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProducto, setCurrentProducto] = useState({ 
    id: null, 
    nombre_producto: '', 
    codigo_producto: '', 
    precio_producto: ''
  });
  const { token } = useContext(AuthContext);

  const API_BASE = API_BASE_URL;

  const fetchProductos = useCallback(async (q = '') => {
    try {
      const url = `${API_BASE}/productos?q=${encodeURIComponent(q)}`;
      const resp = await fetch(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      setProductos(data.items || data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar los productos');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchProductos();
    }, [fetchProductos])
  );

  const handleCreate = () => {
    setEditMode(false);
    setCurrentProducto({ 
      id: null, 
      nombre_producto: '', 
      codigo_producto: '', 
      precio_producto: ''
    });
    setModalVisible(true);
  };

  const handleEdit = (producto) => {
    setEditMode(true);
    setCurrentProducto({ 
      ...producto, 
      precio_producto: String(producto.precio_producto || '') 
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!currentProducto.nombre_producto) {
      return Alert.alert('Error', 'Ingrese el nombre del producto');
    }

    try {
      const url = editMode 
        ? `${API_BASE}/productos/${currentProducto.id}`
        : `${API_BASE}/productos`;
      
      const method = editMode ? 'PUT' : 'POST';
      
      const body = {
        nombre_producto: currentProducto.nombre_producto,
        codigo_producto: currentProducto.codigo_producto || null,
        precio_producto: parseFloat(currentProducto.precio_producto) || 0,
        cantidad_producto: 0
      };

      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      Alert.alert('Éxito', editMode ? 'Producto actualizado' : 'Producto creado');
      setModalVisible(false);
      fetchProductos();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (producto) => {
    Alert.alert(
      'Confirmar',
      `¿Eliminar ${producto.nombre_producto}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE}/productos/${producto.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Éxito', 'Producto eliminado');
              fetchProductos();
            } catch (_error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemContent}>
        <View style={styles.productInfo}>
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{item.nombre_producto}</Text>
            {item.codigo_producto && (
              <Text style={styles.productCode}>Código: {item.codigo_producto}</Text>
            )}
            <Text style={styles.productPrice}>${item.precio_producto || 0}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
            <Text style={styles.editText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput 
          placeholder="Buscar productos..." 
          style={styles.search} 
          value={searchQuery} 
          onChangeText={(t) => { 
            setSearchQuery(t); 
            fetchProductos(t); 
          }}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={productos} 
        keyExtractor={(i) => String(i.id)} 
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay productos</Text>
        }
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editMode ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={currentProducto.nombre_producto}
                onChangeText={(t) => setCurrentProducto({ ...currentProducto, nombre_producto: t })}
                placeholder="Nombre del producto"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Código</Text>
              <TextInput
                style={styles.input}
                value={currentProducto.codigo_producto}
                onChangeText={(t) => setCurrentProducto({ ...currentProducto, codigo_producto: t })}
                placeholder="Código (opcional)"
                maxLength={6}
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.label}>Precio</Text>
              <TextInput
                style={styles.input}
                value={currentProducto.precio_producto}
                onChangeText={(t) => setCurrentProducto({ ...currentProducto, precio_producto: t })}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { 
    flexDirection: 'row', 
    padding: 12, 
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  search: { 
    flex: 1,
    backgroundColor: '#F9FAFB', 
    padding: 12, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  list: {
    padding: 12
  },
  item: { 
    padding: 16, 
    borderRadius: 12, 
    backgroundColor: '#fff', 
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  placeholderText: {
    fontSize: 28
  },
  productDetails: {
    flex: 1
  },
  productName: { 
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
    marginBottom: 4
  },
  productCode: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 4
  },
  productPrice: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    gap: 8
  },
  editButton: {
    padding: 8
  },
  editText: {
    fontSize: 20
  },
  deleteButton: {
    padding: 8
  },
  deleteText: {
    fontSize: 20
  },
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 32,
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827'
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
    color: '#111827'
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#3B82F6'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
