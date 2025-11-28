import React, { useState, useCallback, useContext } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import AuthContext from '../../components/AuthContext';
import { API_BASE_URL } from '../../config/api';
import CustomAlert from '../../components/CustomAlert';
import { useAlert } from '../../hooks/useAlert';

export default function VentasTab() {
  const [ventas, setVentas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalleModalVisible, setDetalleModalVisible] = useState(false);
  const [ventaDetalle, setVentaDetalle] = useState(null);
  
  // Nueva estructura: array de usuarios con sus carritos
  // Formato: [{ usuario_id, nombres, apellidos, carrito: [{producto_id, nombre_producto, cantidad, precio_unitario}] }]
  const [usuariosVentas, setUsuariosVentas] = useState([]);
  
  const { token } = useContext(AuthContext);
  const { alert, alertConfig, hideAlert } = useAlert();

  const API_BASE = API_BASE_URL;

  const fetchVentas = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/ventas`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      console.log('Ventas recibidas:', data);
      
      if (!Array.isArray(data) || data.length === 0) {
        console.log('No hay ventas');
        setVentas([]);
        return;
      }
      
      // Agrupar ventas por fecha (mismo minuto = mismo pedido)
      // Usar un margen de 2 minutos para agrupar ventas del mismo pedido
      const grouped = {};
      const sortedData = [...data].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      sortedData.forEach(venta => {
        const fecha = new Date(venta.fecha);
        const timestamp = fecha.getTime();
        
        // Buscar si existe un grupo dentro de 2 minutos
        let foundGroup = false;
        for (let key in grouped) {
          const groupTime = new Date(grouped[key].fecha).getTime();
          if (Math.abs(timestamp - groupTime) <= 120000) { // 2 minutos en ms
            grouped[key].ventas.push(venta);
            grouped[key].totalGeneral += parseFloat(venta.total || 0);
            foundGroup = true;
            break;
          }
        }
        
        if (!foundGroup) {
          const key = `${timestamp}`;
          grouped[key] = {
            fecha: venta.fecha,
            ventas: [venta],
            totalGeneral: parseFloat(venta.total || 0)
          };
        }
      });
      
      // Convertir a array y ordenar por fecha descendente
      const ventasAgrupadas = Object.values(grouped).sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      
      console.log('Ventas agrupadas:', ventasAgrupadas);
      setVentas(ventasAgrupadas);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      alert.error('Error', 'No se pudieron cargar las ventas');
    }
  }, [token]);

  const fetchUsuarios = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/usuarios`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      setUsuarios(data.usuarios || data || []);
    } catch (error) {
      console.error(error);
      setUsuarios([]);
    }
  }, [token]);

  const fetchProductos = useCallback(async () => {
    try {
      const resp = await fetch(`${API_BASE}/productos`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const data = await resp.json();
      setProductos(data.items || data || []);
    } catch (error) {
      console.error(error);
      setProductos([]);
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
    setUsuariosVentas([]);
    setModalVisible(true);
  };

  // Agregar un usuario al pedido
  const agregarUsuario = (usuario) => {
    if (usuariosVentas.find(u => u.usuario_id === usuario.id)) {
      alert.warning('Atención', 'Este usuario ya está agregado');
      return;
    }
    setUsuariosVentas([...usuariosVentas, {
      usuario_id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      carrito: []
    }]);
  };

  // Quitar un usuario del pedido
  const quitarUsuario = (usuario_id) => {
    setUsuariosVentas(usuariosVentas.filter(u => u.usuario_id !== usuario_id));
  };

  // Agregar producto al carrito de un usuario específico
  const agregarProductoAUsuario = (usuario_id, producto) => {
    setUsuariosVentas(usuariosVentas.map(u => {
      if (u.usuario_id !== usuario_id) return u;
      
      const existe = u.carrito.find(item => item.producto_id === producto.id);
      if (existe) {
        return {
          ...u,
          carrito: u.carrito.map(item =>
            item.producto_id === producto.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        };
      } else {
        return {
          ...u,
          carrito: [...u.carrito, {
            producto_id: producto.id,
            nombre_producto: producto.nombre_producto,
            cantidad: 1,
            precio_unitario: producto.precio_producto || 0
          }]
        };
      }
    }));
  };

  // Quitar producto del carrito de un usuario
  const quitarProductoDeUsuario = (usuario_id, producto_id) => {
    setUsuariosVentas(usuariosVentas.map(u => {
      if (u.usuario_id !== usuario_id) return u;
      
      const item = u.carrito.find(i => i.producto_id === producto_id);
      if (!item) return u;
      
      if (item.cantidad > 1) {
        return {
          ...u,
          carrito: u.carrito.map(i =>
            i.producto_id === producto_id
              ? { ...i, cantidad: i.cantidad - 1 }
              : i
          )
        };
      } else {
        return {
          ...u,
          carrito: u.carrito.filter(i => i.producto_id !== producto_id)
        };
      }
    }));
  };

  // Calcular total por usuario
  const calcularTotalUsuario = (carrito) => {
    return carrito.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
  };

  // Calcular total general
  const calcularTotalGeneral = () => {
    return usuariosVentas.reduce((sum, u) => sum + calcularTotalUsuario(u.carrito), 0);
  };

  const guardarVenta = async () => {
    if (usuariosVentas.length === 0) {
      return alert.error('Error', 'Agregue al menos un usuario con productos');
    }

    // Verificar que todos los usuarios tengan productos
    const sinProductos = usuariosVentas.filter(u => u.carrito.length === 0);
    if (sinProductos.length > 0) {
      return alert.error('Error', 'Todos los usuarios deben tener al menos un producto');
    }

    try {
      console.log('Guardando ventas para usuarios:', usuariosVentas);
      
      // Crear una venta por cada usuario
      const promesas = usuariosVentas.map(async usuario => {
        console.log('Enviando venta:', { usuario_id: usuario.usuario_id, productos: usuario.carrito });
        
        const response = await fetch(`${API_BASE}/ventas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            usuario_id: usuario.usuario_id,
            productos: usuario.carrito
          })
        });
        
        const responseData = await response.json();
        console.log('Respuesta del servidor:', responseData);
        
        if (!response.ok) {
          throw new Error(responseData.message || responseData.error || 'Error al crear venta');
        }
        
        return responseData;
      });

      const resultados = await Promise.all(promesas);
      console.log('Ventas creadas:', resultados);

      alert.success('Éxito', `Se registraron ${usuariosVentas.length} venta(s) correctamente`);
      setModalVisible(false);
      setUsuariosVentas([]);
      await fetchVentas();
    } catch (error) {
      console.error('Error al guardar ventas:', error);
      alert.error('Error', error.message);
    }
  };

  const verDetalleVenta = async (ventasDelPedido, fechaPedido) => {
    try {
      // Obtener detalles de todas las ventas del pedido
      const detallesPromises = ventasDelPedido.map(venta =>
        fetch(`${API_BASE}/ventas/${venta.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
      );
      
      const detalles = await Promise.all(detallesPromises);
      
      // Estructurar datos para el modal
      const pedidoCompleto = {
        fecha: fechaPedido,
        ventasIds: ventasDelPedido.map(v => v.id),
        usuarios: detalles.map(detalle => ({
          nombres: detalle.venta.nombres,
          apellidos: detalle.venta.apellidos,
          productos: detalle.productos,
          total: parseFloat(detalle.venta.total)
        })),
        totalGeneral: detalles.reduce((sum, d) => sum + parseFloat(d.venta.total), 0)
      };
      
      setVentaDetalle(pedidoCompleto);
      setDetalleModalVisible(true);
    } catch (_error) {
      alert.error('Error', 'No se pudo cargar el detalle del pedido');
    }
  };

  const eliminarVenta = (ventasDelPedido) => {
    alert.confirmDestructive(
      'Confirmar eliminación',
      '¿Está seguro de eliminar este pedido completo?',
      async () => {
            try {
              // Eliminar todas las ventas del pedido
              await Promise.all(
                ventasDelPedido.map(venta =>
                  fetch(`${API_BASE}/ventas/${venta.id}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                  })
                )
                );
              alert.success('Éxito', 'Pedido eliminado');
              setDetalleModalVisible(false);
              fetchVentas();
            } catch (_error) {
              alert.error('Error', 'No se pudo eliminar el pedido');
            }
      }
    );
  };  const renderVenta = ({ item }) => {
    const fecha = new Date(item.fecha);
    const fechaFormato = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const cantUsuarios = item.ventas.length;
    
    return (
      <TouchableOpacity style={styles.ventaItem} onPress={() => verDetalleVenta(item.ventas, item.fecha)}>
        <View style={styles.ventaHeader}>
          <Text style={styles.ventaId}>Pedido {fechaFormato}</Text>
          <Text style={styles.ventaTotal}>${item.totalGeneral.toFixed(2)}</Text>
        </View>
        <Text style={styles.ventaFecha}>{fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</Text>
        <Text style={styles.ventaUsuario}>{cantUsuarios} usuario{cantUsuarios > 1 ? 's' : ''}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.nuevaButton} onPress={handleNuevaVenta}>
          <Text style={styles.nuevaButtonText}>+ Nuevo Pedido</Text>
        </TouchableOpacity>
      </View>

      <FlatList 
        data={ventas} 
        keyExtractor={(item, index) => `pedido-${index}-${new Date(item.fecha).getTime()}`} 
        renderItem={renderVenta}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay pedidos registrados</Text>
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
              <Text style={styles.modalTitle}>Nuevo Pedido Múltiple</Text>

              {/* Seleccionar Usuario para agregar */}
              <Text style={styles.label}>Agregar Usuario</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={null}
                  onValueChange={(value) => {
                    if (value && usuarios) {
                      const usuario = usuarios.find(u => u.id === value);
                      if (usuario) agregarUsuario(usuario);
                    }
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Seleccione un usuario..." value={null} />
                  {(usuarios || []).filter(u => !usuariosVentas.find(uv => uv.usuario_id === u.id)).map(u => (
                    <Picker.Item 
                      key={u.id} 
                      label={`${u.nombres} ${u.apellidos}`} 
                      value={u.id} 
                    />
                  ))}
                </Picker>
              </View>

              {/* Lista de usuarios agregados con sus carritos */}
              {usuariosVentas.length > 0 ? (
                <>
                  <Text style={styles.label}>Usuarios en este pedido ({usuariosVentas.length})</Text>
                  {usuariosVentas.map((usuario) => (
                    <View key={usuario.usuario_id} style={styles.usuarioCard}>
                      <View style={styles.usuarioHeader}>
                        <Text style={styles.usuarioNombre}>
                          {usuario.nombres} {usuario.apellidos}
                        </Text>
                        <TouchableOpacity 
                          onPress={() => quitarUsuario(usuario.usuario_id)}
                          style={styles.btnQuitar}
                        >
                          <Text style={styles.btnQuitarText}>✕</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Carrito del usuario */}
                      {usuario.carrito.length > 0 && (
                        <View style={styles.usuarioCarrito}>
                          {usuario.carrito.map((item) => (
                            <View key={item.producto_id} style={styles.itemCarrito}>
                              <Text style={styles.itemNombre}>{item.nombre_producto}</Text>
                              <View style={styles.itemControls}>
                                <TouchableOpacity 
                                  onPress={() => quitarProductoDeUsuario(usuario.usuario_id, item.producto_id)}
                                  style={styles.btnCantidadSmall}
                                >
                                  <Text style={styles.btnText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.cantidadSmall}>{item.cantidad}</Text>
                                <TouchableOpacity 
                                  onPress={() => agregarProductoAUsuario(usuario.usuario_id, {
                                    id: item.producto_id,
                                    nombre_producto: item.nombre_producto,
                                    precio_producto: item.precio_unitario
                                  })}
                                  style={styles.btnCantidadSmall}
                                >
                                  <Text style={styles.btnText}>+</Text>
                                </TouchableOpacity>
                                <Text style={styles.itemPrecio}>
                                  ${(item.cantidad * item.precio_unitario).toFixed(2)}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Agregar productos al usuario */}
                      <Text style={styles.labelSmall}>Agregar producto:</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productosHorizontal}>
                        {(productos || []).map((p) => (
                          <TouchableOpacity 
                            key={p.id}
                            style={styles.productoChip}
                            onPress={() => agregarProductoAUsuario(usuario.usuario_id, p)}
                          >
                            <Text style={styles.productoChipText}>{p.nombre_producto}</Text>
                            <Text style={styles.productoChipPrecio}>${p.precio_producto}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      {/* Total del usuario */}
                      <View style={styles.totalUsuario}>
                        <Text style={styles.totalUsuarioLabel}>Total:</Text>
                        <Text style={styles.totalUsuarioValue}>
                          ${calcularTotalUsuario(usuario.carrito).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {/* Total general */}
                  <View style={styles.totalGeneral}>
                    <Text style={styles.totalGeneralLabel}>TOTAL GENERAL:</Text>
                    <Text style={styles.totalGeneralValue}>
                      ${calcularTotalGeneral().toFixed(2)}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={styles.empty}>Agregue usuarios para comenzar</Text>
              )}

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
                  <Text style={styles.saveButtonText}>Guardar ({usuariosVentas.length})</Text>
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
                    Pedido {new Date(ventaDetalle.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                  
                  <View style={styles.detalleCard}>
                    <Text style={styles.detalleLabel}>Fecha:</Text>
                    <Text style={styles.detalleValue}>
                      {new Date(ventaDetalle.fecha).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.detalleCard}>
                    <Text style={styles.detalleLabel}>Usuarios:</Text>
                    <Text style={styles.detalleValue}>
                      {ventaDetalle.usuarios?.length || 0}
                    </Text>
                  </View>

                  {/* Lista de usuarios con sus productos */}
                  {ventaDetalle.usuarios?.map((usuario, indexUsuario) => (
                    <View key={indexUsuario} style={styles.usuarioDetalleCard}>
                      <View style={styles.usuarioDetalleHeader}>
                        <Text style={styles.usuarioDetalleNombre}>
                          {`${usuario.nombres} ${usuario.apellidos}`}
                        </Text>
                        <Text style={styles.usuarioDetalleTotal}>
                          ${usuario.total.toFixed(2)}
                        </Text>
                      </View>

                      {usuario.productos?.map((producto, indexProducto) => (
                        <View key={indexProducto} style={styles.productoDetalleItem}>
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
                    </View>
                  ))}

                  <View style={styles.totalGeneralCard}>
                    <Text style={styles.totalGeneralLabel}>Total General:</Text>
                    <Text style={styles.totalGeneralValue}>
                      ${ventaDetalle.totalGeneral?.toFixed(2)}
                    </Text>
                  </View>
                </>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.deleteButton]} 
                  onPress={() => eliminarVenta(ventaDetalle?.ventasIds?.map(id => ({ id })) || [])}
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
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
  },
  // Estilos para multi-usuario
  usuarioCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  usuarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  usuarioNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  btnQuitar: {
    backgroundColor: '#EF4444',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnQuitarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700'
  },
  usuarioCarrito: {
    marginBottom: 8
  },
  itemCarrito: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6
  },
  itemNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  btnCantidadSmall: {
    backgroundColor: '#E5E7EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cantidadSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 8
  },
  itemPrecio: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6'
  },
  labelSmall: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6
  },
  productosHorizontal: {
    marginBottom: 10
  },
  productoChip: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    alignItems: 'center'
  },
  productoChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6'
  },
  productoChipPrecio: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2
  },
  totalUsuario: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    marginTop: 4
  },
  totalUsuarioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  totalUsuarioValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  totalGeneral: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8
  },
  totalGeneralLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white'
  },
  totalGeneralValue: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white'
  },
  usuarioDetalleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  usuarioDetalleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  usuarioDetalleNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  usuarioDetalleTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B5CF6'
  },
  totalGeneralCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});
