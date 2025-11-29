const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1]; // "Bearer TOKEN"
        
        if (!token) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.id;
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error al verificar token:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión nuevamente' });
        }
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = { verificarToken };
