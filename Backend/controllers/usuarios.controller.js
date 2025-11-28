const db =require('../models/conexion');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

//Funcion de fallback para encriptación usando crypto nativo.

function encriptacionConCrypto(password) {
    try {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `$crypto$${salt}$${hash}`;
    } catch (error) {
        console.error('Error en la encriptación con crypto:', error);
        throw error;
    }
}

//Funcion para veirificacion de contraseñas.

function verificaContrasena(password, hash) {
    try {
        if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {

            return bcrypt.compareSync(password, hash);
    } else if (hash.startsWith('$crypto$')) {
            const parts = hash.split('$');
            const salt = parts[2];
            const storedHash = parts[3];
            const hashToVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
            return storedHash === hashToVerify;
        } else {
            throw new Error('Formato de hash desconocido');
        }
    } catch (error) {
        console.error('Error en la verificación de la contraseña:', error);
        throw error;
    }
}

//Obtener todos los usuarios activos.

const getUsuarios = async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM usuarios WHERE estado = 1');
        res.json(results);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//Obtener usuarios por ID.

const getUsuarioPorId = async (req, res) => {
    const id = req.params.id;
    try {
        const [results] = await db.query('SELECT * FROM usuarios WHERE id = ? AND estado = 1', [id]);
        if (results.length === 0) return res.status(404).json({message: 'Usuario no encontrado'});
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

//Creacion de un usuario nuevo.

const crearUsuario = async (req, res) => {
    try {
        const {nombres, apellidos, telefono} = req.body;

        const sql = 'INSERT INTO usuarios (nombres, apellidos, telefono) VALUES (?, ?, ?)';
        const values = [nombres, apellidos, telefono || null];

        const [result] = await db.query(sql, values);

        console.log('Usuario creado con exito', {id: result.insertId, nombres, apellidos, telefono});

        res.status(201).json({id: result.insertId, nombres, apellidos, telefono});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//Actualizar Usuario.

const actualizarUsuario = async (req, res) => {
    const id = req.params.id;
    const {
        nombres, apellidos, telefono
    } = req.body;

    const sql = 'UPDATE usuarios SET nombres = ?, apellidos = ?, telefono = ? WHERE id = ?';

    const values = [nombres, apellidos, telefono || null, id];

    try {
        await db.query(sql, values);
        res.json({message: 'Usuario actualizado con exito'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//SoftDelete de los Usuarios.

const eliminarUsuario = async (req, res) => {
    const id = req.params.id;
    try {
        await db.query('UPDATE usuarios SET estado = 0 WHERE id = ?', [id]);
        res.json({message: 'Usuario eliminado con exito'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//Listar Usuarios Para el Buscador.

const buscarUsuarios = async (req, res) => {
    const {page = 1, limit = 10, letra = ''} = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;

    try {
        let query;
        let countQuery;
        let values;

        if (letra) {
            query = 'SELECT * FROM usuarios WHERE estado = 1 AND (nombres LIKE ? OR apellidos LIKE ?) ORDER BY nombres ASC LIMIT ? OFFSET ?';
            countQuery = 'SELECT COUNT(*) AS total FROM usuarios WHERE estado = 1 AND (nombres LIKE ? OR apellidos LIKE ?)';
            values = [`${letra}%`, `${letra}%`, limitNum, offset];
        } else {
            query = 'SELECT * FROM usuarios WHERE estado = 1 ORDER BY nombres ASC LIMIT ? OFFSET ?';
            countQuery = 'SELECT COUNT(*) AS total FROM usuarios WHERE estado = 1';
            values = [limitNum, offset];
        }

        const [usuarios] = await db.query(query, values);
        const [totalResult] = await db.query(countQuery, letra ? [`${letra}%`, `${letra}%`] : []);
        const total = totalResult[0].total;

        res.json({usuarios, total});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    getUsuarios,
    getUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    buscarUsuarios,
};