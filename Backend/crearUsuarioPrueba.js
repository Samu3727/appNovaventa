const db = require('./models/conexion');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function crearUsuarioPrueba() {
    try {
        const password = '123456';
        const hash = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO Usuarios (nombres, apellidos, correo, contrasena, estado) VALUES (?, ?, ?, ?, ?)';
        const values = ['Admin', 'Test', 'admin@test.com', hash, 1];
        
        const [result] = await db.query(sql, values);
        
        console.log('✅ Usuario creado exitosamente!');
        console.log('📧 Correo: admin@test.com');
        console.log('🔑 Contraseña: 123456');
        console.log('🆔 ID:', result.insertId);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message);
        process.exit(1);
    }
}

crearUsuarioPrueba();
