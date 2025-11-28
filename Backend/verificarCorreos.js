const db = require('./models/conexion');
require('dotenv').config();

async function verificarCorreos() {
    try {
        console.log('🔍 Verificando correos en la base de datos...\n');
        
        const [usuarios] = await db.query('SELECT id, correo, nombres, apellidos FROM Usuarios WHERE estado = 1');
        
        if (usuarios.length === 0) {
            console.log('❌ No se encontraron usuarios activos');
        } else {
            console.log(`✅ Se encontraron ${usuarios.length} usuario(s) activo(s):\n`);
            usuarios.forEach(user => {
                console.log(`ID: ${user.id}`);
                console.log(`Correo: "${user.correo}"`);
                console.log(`Correo en minúsculas: "${user.correo.toLowerCase()}"`);
                console.log(`Nombre: ${user.nombres} ${user.apellidos}`);
                console.log('---');
            });
        }
        
        // Probar búsqueda específica
        const correoTest = 'admin@admin.com';
        console.log(`\n🔍 Buscando específicamente: "${correoTest}"`);
        const [resultado1] = await db.query('SELECT * FROM Usuarios WHERE correo = ?', [correoTest]);
        console.log(`Búsqueda exacta (case-sensitive): ${resultado1.length} resultado(s)`);
        
        const [resultado2] = await db.query('SELECT * FROM Usuarios WHERE LOWER(correo) = LOWER(?)', [correoTest]);
        console.log(`Búsqueda LOWER(): ${resultado2.length} resultado(s)`);
        
        if (resultado2.length > 0) {
            console.log('\n✅ Usuario encontrado con LOWER():');
            console.log(`ID: ${resultado2[0].id}`);
            console.log(`Correo: "${resultado2[0].correo}"`);
            console.log(`Estado: ${resultado2[0].estado}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

verificarCorreos();
