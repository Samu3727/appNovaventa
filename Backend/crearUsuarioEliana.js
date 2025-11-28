const db = require('./models/conexion');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function crearUsuarioEliana() {
    try {
        const password = 'Eliana491268*';
        const hash = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO usuarios (nombres, apellidos, correo, telefono, contrasena, estado) VALUES (?, ?, ?, ?, ?, ?)';
        const values = ['Eliana Elizabeth', 'Esquivel', 'eesquivel27@hotmail.com', '3176653160', hash, 1];
        
        const [result] = await db.query(sql, values);
        
        console.log('✅ Usuario creado exitosamente en Railway!');
        console.log('👤 Nombre: Eliana Elizabeth Esquivel');
        console.log('📧 Correo: eesquivel27@hotmail.com');
        console.log('📱 Teléfono: 3176653160');
        console.log('🔑 Contraseña: Eliana491268*');
        console.log('🆔 ID:', result.insertId);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message);
        process.exit(1);
    }
}

crearUsuarioEliana();
