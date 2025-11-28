const db = require('../models/conexion');

// Crear una venta y asignar productos
const crearVenta = async (req, res) => {
    try {
        const { usuario_id, productos = [] } = req.body; // productos: [{producto_id, cantidad, precio_unitario}]

        if (!usuario_id || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ message: 'usuario_id y productos son requeridos' });
        }

        // Calcular total
        const total = productos.reduce((sum, p) => sum + (parseFloat(p.precio_unitario || 0) * parseInt(p.cantidad || 1)), 0);

        // Insertar venta con fecha actual
        const fechaActual = new Date();
        const [ventaResult] = await db.query('INSERT INTO ventas (usuario_id, fecha, total) VALUES (?, ?, ?)', [usuario_id, fechaActual, total]);
        const ventaId = ventaResult.insertId;

        const insertPromises = productos.map(p => {
            const precio = parseFloat(p.precio_unitario || 0).toFixed(2);
            const cantidad = parseInt(p.cantidad || 1);
            return db.query('INSERT INTO ventasproductos (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', [ventaId, p.producto_id, cantidad, precio]);
        });

        await Promise.all(insertPromises);

        res.status(201).json({ id: ventaId, total });
    } catch (error) {
        console.error('Error al crear venta: ', error);
        res.status(500).json({ error: error.message });
    }
};

// Listar ventas (con filtros opcionales)
const listarVentas = async (req, res) => {
    try {
        const { usuario_id } = req.query;
        let query = 'SELECT v.*, u.nombres, u.apellidos FROM ventas v LEFT JOIN usuarios u ON v.usuario_id = u.id WHERE v.estado = 1';
        const params = [];
        if (usuario_id) {
            query += ' AND v.usuario_id = ?';
            params.push(usuario_id);
        }
        query += ' ORDER BY v.fecha DESC';

        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error al listar ventas: ', error);
        res.status(500).json({ error: error.message });
    }
};

// Obtener una venta con sus productos
const getVentaPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const [ventas] = await db.query('SELECT v.*, u.nombres, u.apellidos FROM ventas v LEFT JOIN usuarios u ON v.usuario_id = u.id WHERE v.id = ?', [id]);
        if (!ventas || ventas.length === 0) return res.status(404).json({ message: 'Venta no encontrada' });
        const venta = ventas[0];

        const [productos] = await db.query('SELECT vp.*, p.nombre_producto, p.codigo_producto FROM ventasproductos vp JOIN productos p ON p.id = vp.producto_id WHERE vp.venta_id = ?', [id]);

        res.json({ venta, productos });
    } catch (error) {
        console.error('Error al obtener venta: ', error);
        res.status(500).json({ error: error.message });
    }
};

// Eliminar venta (soft delete)
const eliminarVenta = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE ventas SET estado = 0 WHERE id = ?', [id]);
        res.json({ message: 'Venta eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar venta: ', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    crearVenta,
    listarVentas,
    getVentaPorId,
    eliminarVenta
};
