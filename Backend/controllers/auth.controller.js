const db = require('../models/conexion');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.SECRET_KEY || 'clave_secreta';

// Login
const loginUsuario = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)', [correo]);

        if (!rows || rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const usuario = rows[0];

        const contraseñaValida = await bcrypt.compare(contrasena, usuario.contrasena || '');

        if (!contraseñaValida) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            nombre: `${usuario.nombres} ${usuario.apellidos}`
        };

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

        res.json({
            token,
            usuario: {
                id: usuario.id,
                nombres: usuario.nombres,
                apellidos: usuario.apellidos,
                correo: usuario.correo
            }
        });
    } catch (error) {
        console.error('Error al autenticar usuario: ', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { loginUsuario };