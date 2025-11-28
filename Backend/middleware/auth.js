const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // "Bearer TOKEN"
        
        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.id;
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = { verificarToken };
