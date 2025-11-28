require('dotenv').config();
const db = require('./models/conexion');

async function verificarTablas() {
    try {
        console.log('Verificando tablas en Railway...');
        const [tables] = await db.query('SHOW TABLES');
        console.log('✅ Tablas encontradas:', tables);
        
        if (tables.length === 0) {
            console.log('\n⚠️  No hay tablas. Necesitas ejecutar setupDatabase.js');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

verificarTablas();
