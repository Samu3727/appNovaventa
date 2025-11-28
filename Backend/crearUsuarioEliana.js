const db = require('./models/conexion');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function crearUsuarioEliana() {
    try {
        const password = 'Eliana491268*';
        const hash = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO Usuarios (nombres, apellidos, correo, contrasena, estado) VALUES (?, ?, ?, ?, ?)';
        const values = ['Eliana', 'Esquivel', 'eesquivel27@hotmail.com', hash, 1];
        
        const [result] = await db.query(sql, values);
        
        console.log('✅ Usuario creado exitosamente!');
        console.log('👤 Nombre: Eliana Esquivel');
        console.log('📧 Correo: eesquivel27@hotmail.com');
        console.log('🔑 Contraseña: Eliana491268*');
        console.log('🆔 ID:', result.insertId);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al crear usuario:', error.message);
        process.exit(1);
    }
}

crearUsuarioEliana();
