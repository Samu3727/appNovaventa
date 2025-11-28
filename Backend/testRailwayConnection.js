require('dotenv').config();
const db = require('./models/conexion');

async function testConnection() {
    try {
        console.log('Probando conexión a la base de datos...');
        const [rows] = await db.query('SELECT 1 as test');
        console.log('✅ Conexión exitosa:', rows);
        
        console.log('\nProbando tabla usuarios...');
        const [usuarios] = await db.query('SELECT * FROM usuarios LIMIT 1');
        console.log('✅ Tabla usuarios existe:', usuarios);
        
        console.log('\nProbando búsqueda por correo...');
        const [result] = await db.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)', ['admin@novaventa.com']);
        console.log('✅ Resultado de búsqueda:', result);
        
        if (result && result.length > 0) {
            console.log('\n📧 Usuario encontrado:', {
                id: result[0].id,
                correo: result[0].correo,
                nombres: result[0].nombres,
                apellidos: result[0].apellidos,
                tiene_contrasena: !!result[0].contrasena
            });
        } else {
            console.log('\n⚠️  Usuario no encontrado con correo: admin@novaventa.com');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        process.exit(0);
    }
}

testConnection();
