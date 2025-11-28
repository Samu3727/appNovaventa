import React from 'react';
import { View } from 'react-native';
import ListarUsuarios from './Pages/Usuarios/listarUsuarios';

export default function UsuariosTab() {
  return (
    <View style={{ flex: 1 }}>
      <ListarUsuarios />
    </View>
  );
}
