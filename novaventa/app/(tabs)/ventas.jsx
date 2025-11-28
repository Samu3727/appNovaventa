import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import AuthContext from '../../components/AuthContext';
import { API_BASE_URL } from '../../config/api';

export default function VentasTab() {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleModalVisible, setDetalleModalVisible] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const { token } = useContext(AuthContext);

  const API_BASE = API_BASE_URL;

  const fetchVentas = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/ventas`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      setVentas(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchUsuarios = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/usuarios`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      setUsuarios(data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchProductos = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/productos`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      setProductos(data.items || data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      fetchVentas();
    }, [fetchVentas])
  );

  const handleNuevaVenta = async () => {
    await fetchUsuarios();
    await fetchProductos();
    setCarrito([]);
    setSelectedUsuario(null);
    setModalVisible(true);
  };

  const agregarProducto = (producto) => {
    const existe = carrito.find(item => item.producto_id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.producto_id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        producto_id: producto.id,
        nombre_producto: producto.nombre_producto,
        cantidad: 1,
        precio_unitario: producto.precio_producto || 0
      }]);
    }
  };

  const quitarProducto = (producto_id) => {
    const item = carrito.find(i => i.producto_id === producto_id);
    if (item.cantidad > 1) {
      setCarrito(carrito.map(i => 
        i.producto_id === producto_id 
          ? { ...i, cantidad: i.cantidad - 1 }
          : i
      ));
    } else {
      setCarrito(carrito.filter(i => i.producto_id !== producto_id));
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  };

  const guardarVenta = async () => {
    if (!selectedUsuario || carrito.length === 0) {
      return Alert.alert('Error', 'Seleccione un usuario y agregue productos');
    }

    const total = calcularTotal();

    try {
      const resp = await fetch(`${API_BASE}/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          usuario_id: selectedUsuario,
          productos: carrito,
          total: total
        })
      });

      if (!resp.ok) throw new Error('Error al guardar venta');

      Alert.alert('Éxito', 'Venta registrada correctamente');
      setModalVisible(false);
      fetchVentas();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const verDetalleVenta = async (ventaId) => {
    try {
      const resp = await fetch(`${API_BASE}/ventas/${ventaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      setVentaDetalle(data);
      setDetalleModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el detalle de la venta');
    }
  };

  const eliminarVenta = (ventaId) => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro de eliminar esta venta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_BASE}/ventas/${ventaId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Éxito', 'Venta eliminada');
              setDetalleModalVisible(false);
              fetchVentas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la venta');
            }
          }
        }
      ]
    );
  };

  const renderVenta = ({ item }) => {
    const fecha = new Date(item.fecha);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    return (
      <TouchableOpacity style={styles.ventaItem} onPress={() => verDetalleVenta(item.id)}>
        <View style={styles.ventaHeader}>
          <Text style={styles.ventaId}>Pedido {fechaFormato}</Text>
          <Text style={styles.ventaTotal}>${item.total}</Text>
        </View>
        <Text style={styles.ventaFecha}>{fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.ventaUsuario}>Usuario ID: {item.usuario_id}</Text>
      </TouchableOpacity>
    );
  };

  const renderProductoCarrito = ({ item }) => (
    <View style={styles.carritoItem}>
      <View style={styles.carritoInfo}>
        <Text style={styles.carritoNombre}>{item.nombre_producto}</Text>
        <Text style={styles.carritoPrecio}>${item.precio_unitario} x {item.cantidad}</Text>
      </View>
      <View style={styles.carritoActions}>
        <TouchableOpacity onPress={() => quitarProducto(item.producto_id)} style={styles.btnCantidad}>
          <Text style={styles.btnText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.cantidad}>{item.cantidad}</Text>
        <TouchableOpacity onPress={() => agregarProducto({ id: item.producto_id, nombre_producto: item.nombre_producto, precio_producto: item.precio_unitario })} style={styles.btnCantidad}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProductoDisponible = ({ item }) => (
    <TouchableOpacity style={styles.productoItem} onPress={() => agregarProducto(item)}>
      <Text style={styles.productoNombre}>{item.nombre_producto}</Text>
      <Text style={styles.productoPrecio}>${item.precio_producto || 0}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.nuevaButton} onPress={handleNuevaVenta}>
          <Text style={styles.nuevaButtonText}>+ Nueva Venta</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={ventas} 
        keyExtractor={(i) => String(i.id)} 
        renderItem={renderVenta}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay ventas registradas</Text>
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
              <Text style={styles.modalTitle}>Nueva Venta</Text>

              <Text style={styles.label}>Seleccionar Usuario *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedUsuario}
                  onValueChange={(value) => setSelectedUsuario(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione un usuario..." value={null} />
                  {usuarios.map(u => (
                    <Picker.Item 
                      key={u.id} 
                      label={`${u.nombres} ${u.apellidos}`} 
                      value={u.id} 
                    />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Carrito ({carrito.length})</Text>
              {carrito.length > 0 ? (
                <FlatList
                  data={carrito}
                  keyExtractor={(i) => String(i.producto_id)}
                  renderItem={renderProductoCarrito}
                  scrollEnabled={false}
                  style={styles.carritoList}
                />
              ) : (
                <Text style={styles.carritoVacio}>Carrito vacío</Text>
              )}

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${calcularTotal()}</Text>
              </View>

              <Text style={styles.label}>Agregar Productos</Text>
              <FlatList
                data={productos}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderProductoDisponible}
                scrollEnabled={false}
                style={styles.productosList}
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
                  onPress={guardarVenta}
                >
                  <Text style={styles.saveButtonText}>Guardar Venta</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Detalle de Venta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detalleModalVisible}
        onRequestClose={() => setDetalleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {ventaDetalle && (
                <>
                  <Text style={styles.modalTitle}>
                    Pedido {new Date(ventaDetalle.venta?.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                  
                  <View style={styles.detalleCard}>
                    <Text style={styles.detalleLabel}>Fecha:</Text>
                    <Text style={styles.detalleValue}>
                      {new Date(ventaDetalle.venta?.fecha).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detalleCard}>
                    <Text style={styles.detalleLabel}>Usuario ID:</Text>
                    <Text style={styles.detalleValue}>{ventaDetalle.venta?.usuario_id}</Text>
                  </View>

                  <View style={styles.detalleCard}>
                    <Text style={styles.detalleLabel}>Total:</Text>
                    <Text style={[styles.detalleValue, styles.totalDetalle]}>
                      ${ventaDetalle.venta?.total}
                    </Text>
                  </View>

                  <Text style={styles.label}>Productos ({ventaDetalle.productos?.length || 0})</Text>
                  
                  {ventaDetalle.productos?.map((producto, index) => (
                    <View key={index} style={styles.productoDetalleItem}>
                      <View style={styles.productoDetalleInfo}>
                        <Text style={styles.productoDetalleNombre}>{producto.nombre_producto}</Text>
                        <Text style={styles.productoDetalleCodigo}>Código: {producto.codigo_producto}</Text>
                      </View>
                      <View style={styles.productoDetalleRight}>
                        <Text style={styles.productoDetalleCantidad}>x{producto.cantidad}</Text>
                        <Text style={styles.productoDetallePrecio}>
                          ${producto.precio_unitario}
                        </Text>
                        <Text style={styles.productoDetalleSubtotal}>
                          ${(producto.cantidad * producto.precio_unitario).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]} 
                  onPress={() => eliminarVenta(ventaDetalle?.venta?.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={() => setDetalleModalVisible(false)}
                >
                  <Text style={styles.saveButtonText}>Cerrar</Text>
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
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  nuevaButton: {
    backgroundColor: '#8B5CF6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  nuevaButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  list: {
    padding: 12
  },
  ventaItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  ventaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  ventaId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827'
  },
  ventaTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981'
  },
  ventaFecha: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4
  },
  ventaUsuario: {
    color: '#6B7280',
    fontSize: 14
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
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12
  },
  picker: {
    height: 50
  },
  carritoList: {
    maxHeight: 200
  },
  carritoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  carritoInfo: {
    flex: 1
  },
  carritoNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  carritoPrecio: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4
  },
  carritoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  btnCantidad: {
    backgroundColor: '#E5E7EB',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151'
  },
  cantidad: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    minWidth: 30,
    textAlign: 'center'
  },
  carritoVacio: {
    textAlign: 'center',
    color: '#9CA3AF',
    padding: 20,
    fontSize: 14
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 10,
    marginVertical: 12
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981'
  },
  productosList: {
    maxHeight: 200
  },
  productoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  productoNombre: {
    fontSize: 15,
    color: '#111827'
  },
  productoPrecio: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981'
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
  deleteButton: {
    backgroundColor: '#EF4444'
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#8B5CF6'
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  detalleCard: {
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detalleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280'
  },
  detalleValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827'
  },
  totalDetalle: {
    fontSize: 20,
    color: '#10B981'
  },
  productoDetalleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6'
  },
  productoDetalleInfo: {
    flex: 1
  },
  productoDetalleNombre: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  productoDetalleCodigo: {
    fontSize: 13,
    color: '#6B7280'
  },
  productoDetalleRight: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  productoDetalleCantidad: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 2
  },
  productoDetallePrecio: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2
  },
  productoDetalleSubtotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  }
});
