const db = require('./models/conexion');
require('dotenv').config();

async function verificarEstructura() {
    try {
        console.log('🔍 Verificando estructura de la tabla Usuarios en Railway...\n');
        
        const [columns] = await db.query('DESCRIBE Usuarios');
        
        console.log('📋 Columnas en la tabla Usuarios:');
        columns.forEach(col => {
            console.log(`  ✓ ${col.Field.padEnd(15)} | ${col.Type.padEnd(15)} | ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Verificar si telefono existe
        const tienetelefono = columns.find(col => col.Field === 'telefono');
        
        if (tienetelefono) {
            console.log('\n✅ El campo "telefono" está presente en Railway');
        } else {
            console.log('\n❌ El campo "telefono" NO está en Railway');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarEstructura();
