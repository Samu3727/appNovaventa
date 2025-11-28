const db = require('../models/conexion');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = 'clave_secreta';

//Login.

const loginUsuario = async (req, res) => {

    const {correo, contrasena} = req.body;

    try {
        const [result] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (result.length === 0) {
            return res.status(404).json({message: 'Usuario no encontrado'});
        }

        const usuario = result[0];

        const contraseñaValida = await bcrypt.compare(contrasena, usuario.Contrasena);

        if (!contraseñaValida) {
            return res.status(401).json({message: 'Contraseña incorrecta'});
        }

        //Crear el payload del Token.

        const payload = {
            id: usuario.id,
            correo: usuario.correo,
            nombre: `${usuario.Nombre} ${usuario.Apellido}`
        };

        //Configurar el tiempo de duracion del Token.

        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '10m' });

        //Devolver el token y los datos del usuario.

        res.json ({
            token, 
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo
            },
        });

    } catch (error) {
        console.error('Error al autenticar usuario: ', error);
        res.status(500).json({message: 'Error en el servidor'});
    }
};

module.exports = {
    loginUsuario,
};