-- Agregar columna imagen_perfil a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS imagen_perfil VARCHAR(255);

-- Agregar columna telefono si no existe (para edición de perfil)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
