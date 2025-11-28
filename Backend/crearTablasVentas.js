const db = require('./models/conexion');
require('dotenv').config();

async function crearTablasVentas() {
    try {
        console.log('📦 Creando tablas de Ventas en Railway...\n');
        
        // Crear tabla Ventas
        await db.query(`
            CREATE TABLE IF NOT EXISTS ventas (
                id INT PRIMARY KEY AUTO_INCREMENT,
                usuario_id INT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                total DECIMAL(10,2) DEFAULT 0,
                estado TINYINT DEFAULT 1,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);
        console.log('✅ Tabla ventas creada');
        
        // Crear tabla VentasProductos
        await db.query(`
            CREATE TABLE IF NOT EXISTS ventasproductos (
                id INT PRIMARY KEY AUTO_INCREMENT,
                venta_id INT,
                producto_id INT,
                cantidad INT DEFAULT 1,
                precio_unitario DECIMAL(10,2) DEFAULT 0,
                FOREIGN KEY (venta_id) REFERENCES ventas(id),
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);
        console.log('✅ Tabla ventasproductos creada');
        
        // Verificar tablas creadas
        const [tables] = await db.query('SHOW TABLES');
        console.log('\n📋 Tablas disponibles:');
        tables.forEach(table => {
            console.log(`  ✓ ${Object.values(table)[0]}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

crearTablasVentas();
