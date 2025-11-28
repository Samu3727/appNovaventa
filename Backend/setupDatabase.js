const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
    try {
        // Lee las variables de entorno
        const config = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        };

        console.log('🔌 Conectando a MySQL...');
        console.log('Host:', config.host);
        console.log('User:', config.user);
        console.log('Port:', config.port);

        const connection = await mysql.createConnection(config);
        console.log('✅ Conectado a MySQL');

        // Leer el archivo SQL
        const sqlPath = path.join(__dirname, 'db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📄 Ejecutando SQL...');
        await connection.query(sql);
        console.log('✅ Tablas creadas exitosamente');

        await connection.end();
        console.log('✅ Configuración completada');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

setupDatabase();
