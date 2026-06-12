const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'myrefreshkey';

class TokenService {
  generateAccessToken(admin) {
    return jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
  }

  generateRefreshToken(admin) {
    return jwt.sign(
      { id: admin._id, email: admin.email },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET);
  }
}

module.exports = new TokenService();
