const db = require('../models/conexion');

// Creación de productos.
const crearProducto = async (req, res) => {
    try {
        const { nombre_producto, codigo_producto, precio_producto, cantidad_producto } = req.body;

        if (!nombre_producto) {
            return res.status(400).json({ error: 'El nombre del producto es requerido' });
        }

        const precio = parseFloat(precio_producto) || 0;
        const cantidad = parseInt(cantidad_producto) || 0;

        const query = 'INSERT INTO productos (nombre_producto, codigo_producto, precio_producto, cantidad_producto) VALUES (?, ?, ?, ?)';
        const values = [nombre_producto, codigo_producto || null, precio, cantidad];

        const [result] = await db.query(query, values);

        res.status(201).json({ id: result.insertId, nombre_producto, codigo_producto, precio_producto: precio, cantidad_producto: cantidad });
    } catch (error) {
        console.error('Error al crear el producto: ', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar Productos y buscador.
const listarProductos = async (req, res) => {
    try {
        const { page = 1, limit = 20, q = '' } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;

        let query = 'SELECT * FROM productos WHERE estado = 1';
        const params = [];

        if (q) {
            query += ' AND (nombre_producto LIKE ? OR codigo_producto LIKE ?)';
            params.push(`${q}%`, `${q}%`);
        }

        query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
        params.push(limitNum, offset);

        const [rows] = await db.query(query, params);

        // total count
        let countQuery = 'SELECT COUNT(*) as total FROM productos WHERE estado = 1';
        const countParams = [];
        if (q) {
            countQuery += ' AND (nombre_producto LIKE ? OR codigo_producto LIKE ?)';
            countParams.push(`${q}%`, `${q}%`);
        }
        const [countRows] = await db.query(countQuery, countParams);

        res.status(200).json({ items: rows, total: countRows[0].total });
    } catch (error) {
        console.error('Error al listar los productos: ', error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar Productos.
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_producto, codigo_producto, precio_producto, cantidad_producto } = req.body;

        if (!nombre_producto) {
            return res.status(400).json({ error: 'El nombre del producto es requerido' });
        }

        const precio = parseFloat(precio_producto) || 0;
        const cantidad = parseInt(cantidad_producto) || 0;

        const query = 'UPDATE productos SET nombre_producto = ?, codigo_producto = ?, precio_producto = ?, cantidad_producto = ? WHERE id = ?';
        const values = [nombre_producto, codigo_producto || null, precio, cantidad, id];

        await db.query(query, values);
        res.status(200).json({ message: 'Producto actualizado con exito' });
    } catch (error) {
        console.error('Error al actualizar el producto: ', error);
        res.status(500).json({ error: error.message });
    }
};

// SoftDelete de los Productos.
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE productos SET estado = 0 WHERE id = ?', [id]);
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el producto: ', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearProducto,
    listarProductos,
    actualizarProducto,
    eliminarProducto,
};