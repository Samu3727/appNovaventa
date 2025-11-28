const db = require('./models/conexion');
require('dotenv').config();

async function verificarUsuarios() {
    try {
        const [usuarios] = await db.query('SELECT id, nombres, apellidos, correo, estado FROM Usuarios');
        
        console.log('📋 Usuarios en la base de datos:');
        console.log('================================');
        usuarios.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Nombre: ${user.nombres} ${user.apellidos}`);
            console.log(`Email: ${user.correo}`);
            console.log(`Estado: ${user.estado ? 'Activo' : 'Inactivo'}`);
            console.log('---');
        });
        console.log(`Total: ${usuarios.length} usuarios`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarUsuarios();
