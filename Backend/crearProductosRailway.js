require('dotenv').config();
const db = require('./models/conexion');

async function crearProductos() {
    try {
        const productos = [
            { nombre: 'Laptop HP', precio: 1200.00, cantidad: 10, codigo: 'LAP001' },
            { nombre: 'Mouse Logitech', precio: 25.50, cantidad: 50, codigo: 'MOU001' },
            { nombre: 'Teclado Mecánico', precio: 89.99, cantidad: 30, codigo: 'TEC001' },
            { nombre: 'Monitor Dell 24"', precio: 350.00, cantidad: 15, codigo: 'MON001' },
            { nombre: 'Webcam HD', precio: 45.00, cantidad: 25, codigo: 'WEB001' }
        ];
        
        for (const p of productos) {
            await db.query(
                'INSERT INTO productos (nombre_producto, precio_producto, cantidad_producto, codigo_producto, estado) VALUES (?, ?, ?, ?, ?)',
                [p.nombre, p.precio, p.cantidad, p.codigo, 1]
            );
            console.log(`✅ Producto creado: ${p.nombre}`);
        }
        
        // Verificar
        const [result] = await db.query('SELECT id, nombre_producto, precio_producto, cantidad_producto FROM productos');
        console.log('\n📦 Productos en Railway:', result);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

crearProductos();
