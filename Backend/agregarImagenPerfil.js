const db = require('./models/conexion');

async function agregarCampoImagenPerfil() {
    try {
        console.log('Agregando campo imagen_perfil a la tabla usuarios...');
        
        await db.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS imagen_perfil VARCHAR(255) DEFAULT NULL
        `);
        
        console.log('✓ Campo imagen_perfil agregado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('Error al agregar campo:', error);
        process.exit(1);
    }
}

agregarCampoImagenPerfil();
