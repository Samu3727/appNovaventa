const express = require('express');
const router = express.Router();
const db = require('../models/conexion');
const bcrypt = require('bcryptjs');

// Endpoint temporal para actualizar contraseña
router.post('/update-password', async (req, res) => {
    try {
        const { correo, nuevaContrasena } = req.body;
        
        if (!correo || !nuevaContrasena) {
            return res.status(400).json({ message: 'Faltan parámetros' });
        }
        
        // Generar nuevo hash
        const hash = await bcrypt.hash(nuevaContrasena, 10);
        
        // Actualizar en la base de datos
        const [result] = await db.query(
            'UPDATE usuarios SET contrasena = ? WHERE LOWER(correo) = LOWER(?)',
            [hash, correo]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        // Verificar que funcionó
        const [rows] = await db.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)', [correo]);
        const usuario = rows[0];
        const esValida = await bcrypt.compare(nuevaContrasena, usuario.contrasena);
        
        res.json({ 
            success: true, 
            message: 'Contraseña actualizada',
            verificacion: esValida ? 'OK' : 'ERROR',
            usuario: {
                id: usuario.id,
                correo: usuario.correo,
                nombres: usuario.nombres
            }
        });
    } catch (error) {
        console.error('Error actualizando contraseña:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
});

module.exports = router;
