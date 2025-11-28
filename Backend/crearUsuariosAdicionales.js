require('dotenv').config();
const db = require('./models/conexion');
const bcrypt = require('bcryptjs');

async function crearUsuariosAdicionales() {
    try {
        const usuarios = [
            { nombres: 'Juan', apellidos: 'Pérez', correo: 'juan@test.com', telefono: '1111111111' },
            { nombres: 'María', apellidos: 'García', correo: 'maria@test.com', telefono: '2222222222' },
            { nombres: 'Carlos', apellidos: 'López', correo: 'carlos@test.com', telefono: '3333333333' }
        ];
        
        const hashedPassword = await bcrypt.hash('12345678', 10);
        
        for (const u of usuarios) {
            await db.query(
                'INSERT INTO usuarios (nombres, apellidos, correo, telefono, contrasena, estado) VALUES (?, ?, ?, ?, ?, ?)',
                [u.nombres, u.apellidos, u.correo, u.telefono, hashedPassword, 1]
            );
            console.log(`✅ Usuario creado: ${u.nombres} ${u.apellidos}`);
        }
        
        // Verificar
        const [result] = await db.query('SELECT id, nombres, apellidos, correo, telefono FROM usuarios');
        console.log('\n👥 Usuarios en Railway:', result);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        process.exit(0);
    }
}

crearUsuariosAdicionales();
