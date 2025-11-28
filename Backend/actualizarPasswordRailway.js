async function actualizarPasswordRailway() {
    try {
        const url = 'https://appnovaventa-production.up.railway.app/api/utilidades/update-password';
        
        const data = {
            correo: 'eesquivel27@hotmail.com',
            nuevaContrasena: 'Eliana491268*'
        };
        
        console.log('📡 Actualizando contraseña en Railway...');
        console.log('URL:', url);
        console.log('Correo:', data.correo);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('\n✅ Contraseña actualizada exitosamente en Railway!');
            console.log('Respuesta:', result);
        } else {
            console.log('\n❌ Error:', result);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

actualizarPasswordRailway();
