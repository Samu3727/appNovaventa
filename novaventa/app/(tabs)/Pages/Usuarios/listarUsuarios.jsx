import React, { useState, useCallBack } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput } from "react-native";
import { useFocusEffect } from "expo-router";


//Funcion de listar usuarios.

export default function ListarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); //Funcion para el buscador de los usuarios.
    

    //Llamado a la base de  datos Local.

    // const API_BASE = "http://...";


    //Cargar los usuarios activos.
}