const db = require('../models/conexion');

const runMigration = async (req, res) => {
    try {
        console.log('=== INICIANDO MIGRACIÓN ===');
        
        // Agregar columna imagen_perfil
        try {
            await db.query('ALTER TABLE usuarios ADD COLUMN imagen_perfil VARCHAR(255)');
            console.log('✓ Columna imagen_perfil agregada');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠ Columna imagen_perfil ya existe');
            } else {
                throw error;
            }
        }

        // Agregar columna telefono
        try {
            await db.query('ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20)');
            console.log('✓ Columna telefono agregada');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠ Columna telefono ya existe');
            } else {
                throw error;
            }
        }

        console.log('=== MIGRACIÓN COMPLETADA ===');
        
        res.json({
            success: true,
            message: 'Migración ejecutada exitosamente',
            changes: [
                'Columna imagen_perfil agregada/verificada',
                'Columna telefono agregada/verificada'
            ]
        });
    } catch (error) {
        console.error('=== ERROR EN MIGRACIÓN ===');
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

module.exports = { runMigration };
