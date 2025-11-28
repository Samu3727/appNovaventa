const db = require('./models/conexion');
require('dotenv').config();

async function verificarTablas() {
    try {
        console.log('🔍 Verificando tablas en la base de datos...\n');
        
        const [tables] = await db.query('SHOW TABLES');
        console.log('Tablas disponibles:');
        tables.forEach(table => {
            console.log(`  - ${Object.values(table)[0]}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarTablas();
