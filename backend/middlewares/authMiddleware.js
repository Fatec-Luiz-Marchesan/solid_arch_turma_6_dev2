const TokenService = require('../services/tokenService');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  
  try {
    const decoded = TokenService.verifyAccessToken(token);
    req.adminId = decoded.id;
    req.adminRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
}

module.exports = authMiddleware;
