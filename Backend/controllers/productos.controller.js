const db = require('../models/conexion');

//Creacion de productos.

const crearProducto = async (req, res) => {
    try {
        const {nombres, apellidos} = req.body;

        const imagen_producto = req.file ? req.file.filename : null;

        const query = 'INSERT INTO Productos (nombre_producto, codigo_producto, precio_producto, imagen_producto) VALUES (?, ?, ?, ?)';
        const values = [nombre_producto, codigo_producto || null, precio_producto || null, imagen_producto];

        const [result] = await db.query(query, values);

        res.status(201).json({id: result.insertId});
    } catch (error) {
        console.error('Error al crear el producto: ', error);
        res.status(500).json({error: error.message});
    }
};

//Listar Producto y tambien paa el Buscador.

const listarProductos = async (req, res) => {
    try {
        let query = 'SELECT * FROM Productos WHERE estado = 1';
        let params = [];

        query += 'ORDER BY id DESC';

        const [rows] = await db.query(query, params);

        console.log('Producto encontrados: ', rows.length);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al listar los productos: ', error);
        res.status(500).json({error: error.message});
    }
};

//Actualizar Productos.

const actualizarProducto = async (req, res) => {
    try {
        const {id} = req.params;
        const {nombre_producto, codigo_producto, precio_producto} = req.body;

        const imagen_producto = req.file ? req.file.filename : req.body.imagen_producto;

        const query = 'UPDATE Productos SET nombre_producto = ?, codigo_producto = 0, precio_producto = ?, imagen_producto = ? WHERE id = ?';
        const values = [nombre_producto, codigo_producto || null, precio_producto || null, imagen_producto, id];

        await db.query(query, values);
        res.status(200).json({message: 'Producto actulizado con exito'});
    } catch (error) {
        console.error('Error al actualizar el producto: ', error);
        res.status(500).json({error: error.message});
    }
};

//SoftDelete de los Productos.

const eliminarProducto = async (req, res) => {
    try {
        const {id} = req.params;
        await db.query('Update Productos SET estado = 0 WHERE id = ?', [id]);
        res.json({message: 'Producto eliminado correctamente'});
    } catch (error) {
        console.error('Error al eliminar el producto: ', error);
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    crearProducto,
    listarProductos,
    actualizarProducto,
    eliminarProducto,
};