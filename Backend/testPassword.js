const db = require('./models/conexion');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testPassword() {
    try {
        const correo = 'eesquivel27@hotmail.com';
        const password = 'Eliana491268*';
        
        console.log('🔍 Buscando usuario:', correo);
        
        const [rows] = await db.query('SELECT * FROM Usuarios WHERE correo = ?', [correo]);
        
        if (rows.length === 0) {
            console.log('❌ Usuario no encontrado');
            process.exit(1);
        }
        
        const usuario = rows[0];
        console.log('✅ Usuario encontrado:');
        console.log('   ID:', usuario.id);
        console.log('   Nombre:', usuario.nombres, usuario.apellidos);
        console.log('   Hash almacenado:', usuario.contrasena);
        
        console.log('\n🔐 Probando contraseña:', password);
        const esValida = await bcrypt.compare(password, usuario.contrasena);
        
        if (esValida) {
            console.log('✅ La contraseña es CORRECTA');
        } else {
            console.log('❌ La contraseña es INCORRECTA');
            
            // Crear nuevo hash
            console.log('\n🔄 Generando nuevo hash...');
            const nuevoHash = await bcrypt.hash(password, 10);
            console.log('Nuevo hash:', nuevoHash);
            
            // Actualizar en la base de datos
            await db.query('UPDATE Usuarios SET contrasena = ? WHERE id = ?', [nuevoHash, usuario.id]);
            console.log('✅ Hash actualizado en la base de datos');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testPassword();
