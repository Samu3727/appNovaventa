const db = require('./models/conexion');
require('dotenv').config();

async function verificarVentas() {
    try {
        console.log('🔍 Verificando datos de ventas con usuarios...\n');
        
        // Query actualizada con JOIN
        const [ventas] = await db.query(`
            SELECT v.*, u.nombres, u.apellidos 
            FROM Ventas v 
            LEFT JOIN Usuarios u ON v.usuario_id = u.id 
            WHERE v.estado = 1 
            ORDER BY v.fecha DESC 
            LIMIT 5
        `);
        
        console.log(`✅ Se encontraron ${ventas.length} venta(s):\n`);
        ventas.forEach(venta => {
            console.log(`Venta ID: ${venta.id}`);
            console.log(`Usuario ID: ${venta.usuario_id}`);
            console.log(`Nombres: "${venta.nombres}"`);
            console.log(`Apellidos: "${venta.apellidos}"`);
            console.log(`Total: $${venta.total}`);
            console.log(`Fecha: ${venta.fecha}`);
            console.log('---');
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarVentas();
