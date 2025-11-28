require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function crearUsuarioElianaRailway() {
    // Crear conexión directa a Railway
    const connection = await mysql.createConnection({
        host: 'gondola.proxy.rlwy.net',
        user: 'root',
        password: 'mmldHfyfcUXlvxWkARtvrObfUOmlMcGm',
        database: 'railway',
        port: 57115
    });
    
    try {
        console.log('✅ Conectado a Railway');
        
        // Verificar si ya existe
        const [existing] = await connection.query('SELECT id FROM usuarios WHERE correo = ?', ['eesquivel27@hotmail.com']);
        
        if (existing.length > 0) {
            console.log('⚠️  El usuario ya existe con ID:', existing[0].id);
            return;
        }
        
        const password = 'Eliana491268*';
        const hash = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO usuarios (nombres, apellidos, correo, telefono, contrasena, estado) VALUES (?, ?, ?, ?, ?, ?)';
        const values = ['Eliana Elizabeth', 'Esquivel', 'eesquivel27@hotmail.com', '3176653160', hash, 1];
        
        const [result] = await connection.query(sql, values);
        
        console.log('✅ Usuario creado exitosamente en Railway!');
        console.log('👤 Nombre: Eliana Elizabeth Esquivel');
        console.log('📧 Correo: eesquivel27@hotmail.com');
        console.log('📱 Teléfono: 3176653160');
        console.log('🔑 Contraseña: Eliana491268*');
        console.log('🆔 ID:', result.insertId);
        
        // Verificar
        const [usuarios] = await connection.query('SELECT id, nombres, apellidos, correo, telefono FROM usuarios');
        console.log('\n📋 Todos los usuarios:', usuarios);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

crearUsuarioElianaRailway();
