import React, { useState, useCallback, useContext } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import AuthContext from '../../../../components/AuthContext';

export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const { token } = useContext(AuthContext);

    const fetchUsuarios = useCallback(async (q = '') => {
        try {
            const url = `http://10.0.2.2:8000/api/usuarios/buscar?letra=${encodeURIComponent(q)}`;
            const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await resp.json();
            setUsuarios(data.usuarios || data);
        } catch (error) {
            console.error(error);
        }
    }, [token]);

    useFocusEffect(
        useCallback(() => {
            fetchUsuarios();
        }, [fetchUsuarios])
    );

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.name}>{item.nombres} {item.apellidos}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput placeholder="Buscar usuarios" style={styles.search} value={searchQuery} onChangeText={(t) => { setSearchQuery(t); fetchUsuarios(t); }} />
            <FlatList data={usuarios} keyExtractor={(i) => String(i.id)} renderItem={renderItem} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    search: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 12 },
    item: { padding: 12, borderRadius: 8, backgroundColor: '#fff', marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    name: { fontWeight: '600' }
});