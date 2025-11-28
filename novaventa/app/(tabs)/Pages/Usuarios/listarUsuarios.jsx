import React, { useState, useCallback, useContext } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Alert, Modal, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import AuthContext from '../../../../components/AuthContext';
import { API_BASE_URL } from '../../../../config/api';

export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentUsuario, setCurrentUsuario] = useState({ id: null, nombres: '', apellidos: '', correo: '', contrasena: '' });
    const { token } = useContext(AuthContext);

    const API_BASE = API_BASE_URL;

    const fetchUsuarios = useCallback(async (q = '') => {
        try {
            const url = `${API_BASE}/usuarios/buscar?letra=${encodeURIComponent(q)}`;
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await resp.json();
            setUsuarios(data.usuarios || data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'No se pudo cargar los usuarios');
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchUsuarios();
        }, [fetchUsuarios])
    );

    const handleCreate = () => {
        setEditMode(false);
        setCurrentUsuario({ id: null, nombres: '', apellidos: '', correo: '', contrasena: '' });
        setModalVisible(true);
    };

    const handleEdit = (usuario) => {
        setEditMode(true);
        setCurrentUsuario({ ...usuario, contrasena: '' });
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!currentUsuario.nombres || !currentUsuario.apellidos) {
            return Alert.alert('Error', 'Complete los campos requeridos');
        }

        try {
            const url = editMode 
                ? `${API_BASE}/usuarios/${currentUsuario.id}`
                : `${API_BASE}/usuarios`;
            
            const method = editMode ? 'PUT' : 'POST';
            
            const body = editMode 
                ? { nombres: currentUsuario.nombres, apellidos: currentUsuario.apellidos }
                : currentUsuario;

            const resp = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!resp.ok) throw new Error('Error al guardar');

            Alert.alert('Éxito', editMode ? 'Usuario actualizado' : 'Usuario creado');
            setModalVisible(false);
            fetchUsuarios();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleDelete = (usuario) => {
        Alert.alert(
            'Confirmar',
            `¿Eliminar a ${usuario.nombres} ${usuario.apellidos}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await fetch(`${API_BASE}/usuarios/${usuario.id}`, {
                                method: 'DELETE',
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            Alert.alert('Éxito', 'Usuario eliminado');
                            fetchUsuarios();
                        } catch (error) {
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
                <View>
                    <Text style={styles.name}>{item.nombres} {item.apellidos}</Text>
                    {item.correo && <Text style={styles.email}>{item.correo}</Text>}
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
                    placeholder="Buscar usuarios..." 
                    style={styles.search} 
                    value={searchQuery} 
                    onChangeText={(t) => { 
                        setSearchQuery(t); 
                        fetchUsuarios(t); 
                    }}
                    placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
                    <Text style={styles.addButtonText}>+ Nuevo</Text>
                </TouchableOpacity>
            </View>

            <FlatList 
                data={usuarios} 
                keyExtractor={(i) => String(i.id)} 
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={styles.empty}>No hay usuarios</Text>
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
                                {editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </Text>

                            <Text style={styles.label}>Nombres *</Text>
                            <TextInput
                                style={styles.input}
                                value={currentUsuario.nombres}
                                onChangeText={(t) => setCurrentUsuario({ ...currentUsuario, nombres: t })}
                                placeholder="Nombres"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text style={styles.label}>Apellidos *</Text>
                            <TextInput
                                style={styles.input}
                                value={currentUsuario.apellidos}
                                onChangeText={(t) => setCurrentUsuario({ ...currentUsuario, apellidos: t })}
                                placeholder="Apellidos"
                                placeholderTextColor="#9CA3AF"
                            />

                            {!editMode && (
                                <>
                                    <Text style={styles.label}>Correo</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={currentUsuario.correo}
                                        onChangeText={(t) => setCurrentUsuario({ ...currentUsuario, correo: t })}
                                        placeholder="correo@ejemplo.com"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#9CA3AF"
                                    />

                                    <Text style={styles.label}>Contraseña</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={currentUsuario.contrasena}
                                        onChangeText={(t) => setCurrentUsuario({ ...currentUsuario, contrasena: t })}
                                        placeholder="Contraseña"
                                        secureTextEntry
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </>
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
        backgroundColor: '#10B981',
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
    name: { 
        fontWeight: '600',
        fontSize: 16,
        color: '#111827',
        marginBottom: 4
    },
    email: {
        color: '#6B7280',
        fontSize: 14
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
        backgroundColor: '#10B981'
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    }
});