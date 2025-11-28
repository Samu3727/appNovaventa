require('dotenv').config();
const db = require('./models/conexion');

async function recrearTablas() {
    try {
        console.log('Eliminando tablas antiguas con mayúsculas...');
        
        // Primero eliminar las tablas con foreign keys
        await db.query('DROP TABLE IF EXISTS VentasProductos');
        console.log('✅ VentasProductos eliminada');
        
        await db.query('DROP TABLE IF EXISTS Ventas');
        console.log('✅ Ventas eliminada');
        
        await db.query('DROP TABLE IF EXISTS Productos');
        console.log('✅ Productos eliminada');
        
        await db.query('DROP TABLE IF EXISTS Usuarios');
        console.log('✅ Usuarios eliminada');
        
        console.log('\nCreando tablas en minúsculas...');
        
        // Crear tabla usuarios
        await db.query(`
            CREATE TABLE usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombres VARCHAR(100) NOT NULL,
                apellidos VARCHAR(100) NOT NULL,
                correo VARCHAR(100) UNIQUE NOT NULL,
                telefono VARCHAR(20),
                contrasena VARCHAR(255) NOT NULL,
                estado TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla usuarios creada');
        
        // Crear tabla productos
        await db.query(`
            CREATE TABLE productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_producto VARCHAR(255) NOT NULL,
                precio_producto DECIMAL(10, 2) NOT NULL,
                cantidad_producto INT NOT NULL DEFAULT 0,
                codigo_producto VARCHAR(100) UNIQUE,
                estado TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla productos creada');
        
        // Crear tabla ventas
        await db.query(`
            CREATE TABLE ventas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                fecha DATETIME NOT NULL,
                total DECIMAL(10, 2) NOT NULL,
                estado TINYINT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);
        console.log('✅ Tabla ventas creada');
        
        // Crear tabla ventasproductos
        await db.query(`
            CREATE TABLE ventasproductos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                venta_id INT NOT NULL,
                producto_id INT NOT NULL,
                cantidad INT NOT NULL,
                precio_unitario DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (venta_id) REFERENCES ventas(id),
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);
        console.log('✅ Tabla ventasproductos creada');
        
        console.log('\n✅ Todas las tablas recreadas exitosamente en minúsculas');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

recrearTablas();
