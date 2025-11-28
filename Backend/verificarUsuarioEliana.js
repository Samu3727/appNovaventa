require('dotenv').config();
const db = require('./models/conexion');

async function verificarUsuarioEliana() {
    try {
        console.log('Buscando usuario Eliana...\n');
        
        // Buscar por correo exacto
        const [usuarios1] = await db.query('SELECT id, nombres, apellidos, correo, telefono FROM usuarios WHERE correo = ?', ['eesquivel27@hotmail.com']);
        console.log('Búsqueda por correo exacto:', usuarios1);
        
        // Buscar con LOWER (como lo hace el login)
        const [usuarios2] = await db.query('SELECT id, nombres, apellidos, correo, telefono FROM usuarios WHERE LOWER(correo) = LOWER(?)', ['eesquivel27@hotmail.com']);
        console.log('\nBúsqueda con LOWER:', usuarios2);
        
        // Listar todos los usuarios
        const [todos] = await db.query('SELECT id, nombres, apellidos, correo, telefono FROM usuarios');
        console.log('\nTodos los usuarios en Railway:', todos);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

verificarUsuarioEliana();
