const db = require('./models/conexion');
require('dotenv').config();

async function agregarCampoTelefono() {
    try {
        console.log('📞 Agregando campo telefono a la tabla Usuarios...\n');
        
        // Agregar columna telefono
        await db.query('ALTER TABLE Usuarios ADD COLUMN telefono VARCHAR(20) AFTER correo');
        
        console.log('✅ Campo telefono agregado exitosamente!');
        
        // Verificar la estructura de la tabla
        const [columns] = await db.query('DESCRIBE Usuarios');
        console.log('\n📋 Estructura actualizada de la tabla Usuarios:');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
        });
        
        process.exit(0);
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('ℹ️  La columna telefono ya existe en la tabla');
        } else {
            console.error('❌ Error:', error.message);
        }
        process.exit(1);
    }
}

agregarCampoTelefono();
