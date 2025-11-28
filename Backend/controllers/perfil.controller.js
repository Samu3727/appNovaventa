const db = require('../models/conexion');
const bcrypt = require('bcryptjs');

// Actualizar perfil del usuario
const actualizarPerfil = async (req, res) => {
    try {
        const userId = req.userId; // Viene del middleware de autenticación
        const { nombres, apellidos, correo, telefono, contrasena } = req.body;

        // Verificar que al menos un campo esté presente
        if (!nombres && !apellidos && !correo && !telefono && !contrasena) {
            return res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar' });
        }

        // Construir la query dinámicamente
        let updateFields = [];
        let params = [];

        if (nombres) {
            updateFields.push('nombres = ?');
            params.push(nombres);
        }
        if (apellidos) {
            updateFields.push('apellidos = ?');
            params.push(apellidos);
        }
        if (correo) {
            // Verificar que el correo no esté en uso por otro usuario
            const [existing] = await db.query('SELECT id FROM usuarios WHERE correo = ? AND id != ?', [correo, userId]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'El correo ya está en uso por otro usuario' });
            }
            updateFields.push('correo = ?');
            params.push(correo);
        }
        if (telefono) {
            updateFields.push('telefono = ?');
            params.push(telefono);
        }
        if (contrasena) {
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            updateFields.push('contrasena = ?');
            params.push(hashedPassword);
        }

        params.push(userId);

        const query = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = ?`;
        await db.query(query, params);

        // Obtener usuario actualizado
        const [rows] = await db.query('SELECT id, nombres, apellidos, correo, telefono, imagen_perfil FROM usuarios WHERE id = ?', [userId]);
        
        res.json({ 
            message: 'Perfil actualizado exitosamente', 
            usuario: rows[0] 
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    actualizarPerfil
};
