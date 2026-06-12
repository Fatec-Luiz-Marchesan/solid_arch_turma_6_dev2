const Admin = require('../models/Admin');
const TokenService = require('../services/tokenService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const admin = await Admin.findOne({ email }).select('+password');
      if (!admin) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      const isValid = await admin.comparePassword(password);
      if (!isValid) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Conta desativada' });
      }
      
      const accessToken = TokenService.generateAccessToken(admin);
      const refreshToken = TokenService.generateRefreshToken(admin);
      
      admin.refreshToken = refreshToken;
      admin.lastLogin = new Date();
      await admin.save();
      
      res.json({
        accessToken,
        refreshToken,
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro no login' });
    }
  }
  
  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token obrigatório' });
      }
      
      const decoded = TokenService.verifyRefreshToken(refreshToken);
      const admin = await Admin.findById(decoded.id).select('+refreshToken');
      
      if (!admin || admin.refreshToken !== refreshToken) {
        return res.status(401).json({ message: 'Refresh token inválido' });
      }
      
      const newAccessToken = TokenService.generateAccessToken(admin);
      const newRefreshToken = TokenService.generateRefreshToken(admin);
      
      admin.refreshToken = newRefreshToken;
      await admin.save();
      
      res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      res.status(401).json({ message: 'Refresh token expirado' });
    }
  }
  
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        const decoded = TokenService.verifyRefreshToken(refreshToken);
        await Admin.findByIdAndUpdate(decoded.id, { refreshToken: null });
      }
      
      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro no logout' });
    }
  }
}

module.exports = new AuthController();
