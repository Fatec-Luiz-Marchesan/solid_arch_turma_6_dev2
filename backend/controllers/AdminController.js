const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const validator = require('validator');

class AdminController {
  
  async createAdmin(req, res) {
    try {
      const { name, email, password, role, permissions } = req.body;
      
      if (!name || !email || !password) {
        return res.status(422).json({ 
          message: 'Os campos name, email e password são obrigatórios' 
        });
      }
      
      const emailTaken = await Admin.isEmailTaken(email);
      if (emailTaken) {
        return res.status(409).json({ 
          message: 'Admin já cadastrado com este email' 
        });
      }
      
      const adminData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: role || 'admin'
      };
      
      if (permissions) {
        adminData.permissions = permissions;
      }
      
      const admin = await Admin.create(adminData);
      
      logger.info(`Admin criado: ${admin.email}`);
      
      res.status(201).json({
        message: 'Admin criado com sucesso',
        admin: admin.fullInfo
      });
    } catch (error) {
      logger.error(`Erro ao criar admin: ${error.message}`);
      
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message);
        return res.status(422).json({ errors });
      }
      
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async loginAdmin(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(422).json({ 
          message: 'Email e senha são obrigatórios' 
        });
      }
      
      const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
      
      if (!admin) {
        return res.status(401).json({ 
          message: 'Email ou senha inválidos' 
        });
      }
      
      if (admin.isLocked) {
        return res.status(423).json({ 
          message: 'Conta bloqueada. Tente novamente em 30 minutos' 
        });
      }
      
      if (!admin.isActive) {
        return res.status(403).json({ 
          message: 'Conta desativada. Contate o administrador' 
        });
      }
      
      const isValidPassword = await admin.comparePassword(password);
      
      if (!isValidPassword) {
        await admin.incrementLoginAttempts();
        return res.status(401).json({ 
          message: 'Email ou senha inválidos' 
        });
      }
      
      await admin.resetLoginAttempts();
      admin.updateLastLogin();
      await admin.save();
      
      const token = jwt.sign(
        { 
          id: admin._id, 
          email: admin.email, 
          role: admin.role,
          permissions: admin.permissions
        },
        process.env.JWT_SECRET || 'secret123',
        { expiresIn: '8h' }
      );
      
      logger.info(`Admin logado: ${email}`);
      
      res.status(200).json({
        message: 'Login realizado com sucesso',
        token,
        admin: admin.fullInfo
      });
    } catch (error) {
      logger.error(`Erro no login: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async getAllAdmins(req, res) {
    try {
      const { page = 1, limit = 10, active, role } = req.query;
      
      const query = {};
      if (active !== undefined) query.isActive = active === 'true';
      if (role) query.role = role;
      
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      const admins = await Admin.find(query)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort({ createdAt: -1 });
      
      const total = await Admin.countDocuments(query);
      
      res.status(200).json({
        admins: admins.map(admin => admin.fullInfo),
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      logger.error(`Erro ao listar admins: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async getAdminById(req, res) {
    try {
      const { id } = req.params;
      
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      res.status(200).json(admin.fullInfo);
    } catch (error) {
      logger.error(`Erro ao buscar admin: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      const { name, role, permissions, isActive } = req.body;
      
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      if (name) admin.name = name.trim();
      if (role && ['admin', 'moderator'].includes(role)) admin.role = role;
      if (permissions) admin.updatePermissions(permissions);
      if (isActive !== undefined) {
        if (isActive === true || isActive === 'true') {
          admin.activate();
        } else {
          admin.deactivate();
        }
      }
      
      await admin.save();
      
      logger.info(`Admin atualizado: ${admin.email}`);
      
      res.status(200).json({
        message: 'Admin atualizado com sucesso',
        admin: admin.fullInfo
      });
    } catch (error) {
      logger.error(`Erro ao atualizar admin: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async updatePassword(req, res) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(422).json({ 
          message: 'Senha atual e nova senha são obrigatórias' 
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(422).json({ 
          message: 'A nova senha deve ter no mínimo 6 caracteres' 
        });
      }
      
      const admin = await Admin.findById(id).select('+password');
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      const isValidPassword = await admin.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }
      
      admin.password = newPassword;
      await admin.save();
      
      logger.info(`Senha atualizada para admin: ${admin.email}`);
      
      res.status(200).json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      logger.error(`Erro ao atualizar senha: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      
      const admin = await Admin.findByIdAndDelete(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      logger.info(`Admin deletado: ${admin.email}`);
      
      res.status(200).json({ message: 'Admin deletado com sucesso' });
    } catch (error) {
      logger.error(`Erro ao deletar admin: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async getDashboardStats(req, res) {
    try {
      const stats = await Admin.getStats();
      const recentAdmins = await Admin.find()
        .sort({ createdAt: -1 })
        .limit(5);
      
      res.status(200).json({
        ...stats,
        recentAdmins: recentAdmins.map(admin => admin.fullInfo),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Erro ao buscar stats: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async toggleAdminStatus(req, res) {
    try {
      const { id } = req.params;
      
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      if (admin.isActive) {
        admin.deactivate();
      } else {
        admin.activate();
      }
      
      await admin.save();
      
      logger.info(`Status do admin ${admin.email} alterado para ${admin.isActive}`);
      
      res.status(200).json({
        message: `Admin ${admin.isActive ? 'ativado' : 'desativado'} com sucesso`,
        isActive: admin.isActive
      });
    } catch (error) {
      logger.error(`Erro ao alterar status: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async updatePermissions(req, res) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      
      if (!permissions) {
        return res.status(422).json({ message: 'Permissões são obrigatórias' });
      }
      
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      admin.updatePermissions(permissions);
      await admin.save();
      
      logger.info(`Permissões atualizadas para admin: ${admin.email}`);
      
      res.status(200).json({
        message: 'Permissões atualizadas com sucesso',
        permissions: admin.permissions
      });
    } catch (error) {
      logger.error(`Erro ao atualizar permissões: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
  
  async getAccessibleResources(req, res) {
    try {
      const { id } = req.params;
      
      const admin = await Admin.findById(id);
      if (!admin) {
        return res.status(404).json({ message: 'Admin não encontrado' });
      }
      
      const resources = admin.getAccessibleResources();
      
      res.status(200).json({
        adminId: id,
        resources,
        permissions: admin.permissions
      });
    } catch (error) {
      logger.error(`Erro ao buscar recursos acessíveis: ${error.message}`);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

module.exports = new AdminController();
