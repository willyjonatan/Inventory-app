const { verifyToken } = require('../config/auth');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token.' });
    }
    
    req.user = decoded;
    next();
};

module.exports = { authenticate };