require('dotenv').config();
const db = require('./models/conexion');
const bcrypt = require('bcryptjs');

async function crearUsuario() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const [result] = await db.query(
            'INSERT INTO usuarios (nombres, apellidos, correo, telefono, contrasena, estado) VALUES (?, ?, ?, ?, ?, ?)',
            ['Admin', 'Sistema', 'admin@novaventa.com', '1234567890', hashedPassword, 1]
        );
        
        console.log('✅ Usuario creado exitosamente en Railway');
        console.log('📧 Correo: admin@novaventa.com');
        console.log('🔑 Contraseña: admin123');
        console.log('🆔 ID:', result.insertId);
        
        // Verificar que se creó
        const [usuarios] = await db.query('SELECT id, nombres, apellidos, correo FROM usuarios');
        console.log('\n📋 Usuarios en Railway:', usuarios);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

crearUsuario();
