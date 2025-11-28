const db = require('./models/conexion');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function actualizarPassword() {
    try {
        const correo = 'eesquivel27@hotmail.com';
        const password = 'Eliana491268*';
        
        console.log('🔐 Generando nuevo hash para:', password);
        
        // Usar exactamente el mismo método que auth.controller.js
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Hash generado:', hash);
        
        // Actualizar en Railway
        const [result] = await db.query(
            'UPDATE Usuarios SET contrasena = ? WHERE LOWER(correo) = LOWER(?)',
            [hash, correo]
        );
        
        if (result.affectedRows > 0) {
            console.log('✅ Contraseña actualizada exitosamente');
            
            // Verificar
            const [rows] = await db.query('SELECT * FROM Usuarios WHERE LOWER(correo) = LOWER(?)', [correo]);
            const usuario = rows[0];
            
            console.log('\n🔍 Verificando...');
            const esValida = await bcrypt.compare(password, usuario.contrasena);
            
            if (esValida) {
                console.log('✅ VERIFICACIÓN EXITOSA - La contraseña funciona correctamente');
                console.log('\n📋 Puedes iniciar sesión con:');
                console.log('   Correo:', correo);
                console.log('   Contraseña:', password);
            } else {
                console.log('❌ ERROR - La contraseña aún no funciona');
            }
        } else {
            console.log('❌ No se encontró el usuario');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

actualizarPassword();
