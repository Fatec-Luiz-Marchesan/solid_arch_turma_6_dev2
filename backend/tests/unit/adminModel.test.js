const mongoose = require('mongoose');
const Admin = require('../../models/Admin');

describe('Admin Model Unit Tests - Enhanced', () => {
  
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test_admin_db', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  });
  
  afterAll(async () => {
    await Admin.deleteMany({});
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
  
  beforeEach(async () => {
    await Admin.deleteMany({});
  });
  
  describe('Schema Validation', () => {
    test('deve criar admin válido com todos os campos', async () => {
      const adminData = {
        name: 'João Silva',
        email: 'joao@admin.com',
        password: '123456',
        role: 'admin'
      };
      
      const admin = await Admin.create(adminData);
      
      expect(admin.name).toBe('João Silva');
      expect(admin.email).toBe('joao@admin.com');
      expect(admin.role).toBe('admin');
      expect(admin.isActive).toBe(true);
    });
    
    test('deve rejeitar email inválido', async () => {
      const adminData = {
        name: 'Teste Admin',
        email: 'emailinvalido',
        password: '123456'
      };
      
      await expect(Admin.create(adminData)).rejects.toThrow();
    });
    
    test('deve rejeitar senha muito curta', async () => {
      const adminData = {
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123'
      };
      
      await expect(Admin.create(adminData)).rejects.toThrow();
    });
    
    test('deve rejeitar nome muito curto', async () => {
      const adminData = {
        name: 'Jo',
        email: 'teste@admin.com',
        password: '123456'
      };
      
      await expect(Admin.create(adminData)).rejects.toThrow();
    });
  });
  
  describe('Password Hashing', () => {
    test('deve hash da senha antes de salvar', async () => {
      const adminData = {
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      };
      
      const admin = await Admin.create(adminData);
      const savedAdmin = await Admin.findById(admin._id).select('+password');
      
      expect(savedAdmin.password).not.toBe('123456');
      expect(savedAdmin.password.length).toBeGreaterThan(20);
    });
    
    test('deve comparar senha corretamente', async () => {
      const adminData = {
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      };
      
      const admin = await Admin.create(adminData);
      const isValid = await admin.comparePassword('123456');
      
      expect(isValid).toBe(true);
    });
    
    test('deve rejeitar senha incorreta', async () => {
      const adminData = {
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      };
      
      const admin = await Admin.create(adminData);
      const isValid = await admin.comparePassword('wrong');
      
      expect(isValid).toBe(false);
    });
  });
  
  describe('Login Attempts and Locking', () => {
    test('deve incrementar tentativas de login', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      await admin.incrementLoginAttempts();
      expect(admin.loginAttempts).toBe(1);
      
      await admin.incrementLoginAttempts();
      expect(admin.loginAttempts).toBe(2);
    });
    
    test('deve bloquear conta após 5 tentativas', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      for (let i = 0; i < 5; i++) {
        await admin.incrementLoginAttempts();
      }
      
      expect(admin.loginAttempts).toBe(5);
      expect(admin.lockUntil).toBeDefined();
      expect(admin.isLocked).toBe(true);
    });
    
    test('deve resetar tentativas de login', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      await admin.incrementLoginAttempts();
      await admin.incrementLoginAttempts();
      await admin.resetLoginAttempts();
      
      expect(admin.loginAttempts).toBe(0);
      expect(admin.lockUntil).toBeNull();
      expect(admin.isLocked).toBe(false);
    });
  });
  
  describe('Permission Methods', () => {
    test('deve verificar permissão individual', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        permissions: { manageUsers: true, managePets: false }
      });
      
      expect(admin.hasPermission('manageUsers')).toBe(true);
      expect(admin.hasPermission('managePets')).toBe(false);
    });
    
    test('super_admin deve ter todas permissões', async () => {
      const admin = await Admin.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: '123456',
        role: 'super_admin'
      });
      
      expect(admin.hasPermission('manageUsers')).toBe(true);
      expect(admin.hasPermission('manageAdmins')).toBe(true);
      expect(admin.hasPermission('qualquer_permissao')).toBe(true);
    });
    
    test('deve verificar qualquer permissão', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        permissions: { manageUsers: true, managePets: false }
      });
      
      expect(admin.hasAnyPermission(['manageUsers', 'managePets'])).toBe(true);
      expect(admin.hasAnyPermission(['managePets', 'manageLocations'])).toBe(false);
    });
    
    test('deve verificar todas permissões', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        permissions: { manageUsers: true, managePets: true }
      });
      
      expect(admin.hasAllPermissions(['manageUsers', 'managePets'])).toBe(true);
      expect(admin.hasAllPermissions(['manageUsers', 'manageLocations'])).toBe(false);
    });
    
    test('deve atualizar permissões', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      admin.updatePermissions({ manageUsers: true, viewReports: true });
      
      expect(admin.permissions.manageUsers).toBe(true);
      expect(admin.permissions.viewReports).toBe(true);
      expect(admin.permissions.managePets).toBe(false);
    });
  });
  
  describe('Status Methods', () => {
    test('deve ativar admin', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        isActive: false
      });
      
      admin.activate();
      expect(admin.isActive).toBe(true);
    });
    
    test('deve desativar admin', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        isActive: true
      });
      
      admin.deactivate();
      expect(admin.isActive).toBe(false);
    });
    
    test('deve atualizar último login', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      const before = admin.lastLogin;
      admin.updateLastLogin();
      
      expect(admin.lastLogin).not.toBe(before);
      expect(admin.lastLogin).toBeInstanceOf(Date);
    });
  });
  
  describe('Virtual Fields', () => {
    test('fullInfo deve retornar informações completas', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        role: 'admin'
      });
      
      const fullInfo = admin.fullInfo;
      
      expect(fullInfo).toHaveProperty('id');
      expect(fullInfo).toHaveProperty('name', 'Teste Admin');
      expect(fullInfo).toHaveProperty('email', 'teste@admin.com');
      expect(fullInfo).toHaveProperty('role', 'admin');
      expect(fullInfo).toHaveProperty('isActive', true);
      expect(fullInfo).not.toHaveProperty('password');
    });
    
    test('isLocked deve retornar status correto', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      expect(admin.isLocked).toBe(false);
      
      admin.lockUntil = new Date(Date.now() + 10000);
      expect(admin.isLocked).toBe(true);
    });
  });
  
  describe('Static Methods', () => {
    test('findByEmail deve buscar admin por email', async () => {
      await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      const admin = await Admin.findByEmail('teste@admin.com');
      expect(admin).toBeDefined();
      expect(admin.email).toBe('teste@admin.com');
    });
    
    test('findActive deve buscar apenas admins ativos', async () => {
      await Admin.create({
        name: 'Admin Ativo',
        email: 'ativo@admin.com',
        password: '123456',
        isActive: true
      });
      
      await Admin.create({
        name: 'Admin Inativo',
        email: 'inativo@admin.com',
        password: '123456',
        isActive: false
      });
      
      const activeAdmins = await Admin.findActive();
      expect(activeAdmins).toHaveLength(1);
      expect(activeAdmins[0].email).toBe('ativo@admin.com');
    });
    
    test('findByRole deve buscar admins por role', async () => {
      await Admin.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: '123456',
        role: 'super_admin'
      });
      
      await Admin.create({
        name: 'Admin Normal',
        email: 'admin@admin.com',
        password: '123456',
        role: 'admin'
      });
      
      const superAdmins = await Admin.findByRole('super_admin');
      expect(superAdmins).toHaveLength(1);
      expect(superAdmins[0].role).toBe('super_admin');
    });
    
    test('getStats deve retornar estatísticas', async () => {
      await Admin.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: '123456',
        role: 'super_admin',
        isActive: true
      });
      
      await Admin.create({
        name: 'Admin Normal',
        email: 'admin@admin.com',
        password: '123456',
        role: 'admin',
        isActive: true
      });
      
      await Admin.create({
        name: 'Admin Inativo',
        email: 'inativo@admin.com',
        password: '123456',
        role: 'admin',
        isActive: false
      });
      
      const stats = await Admin.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.active).toBe(2);
      expect(stats.inactive).toBe(1);
      expect(stats.superAdmins).toBe(1);
      expect(stats.admins).toBe(2);
    });
    
    test('isEmailTaken deve verificar email existente', async () => {
      await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456'
      });
      
      const isTaken = await Admin.isEmailTaken('teste@admin.com');
      expect(isTaken).toBe(true);
      
      const isNotTaken = await Admin.isEmailTaken('novo@admin.com');
      expect(isNotTaken).toBe(false);
    });
  });
  
  describe('Resource Access Methods', () => {
    test('getAccessibleResources deve retornar recursos acessíveis', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        permissions: {
          manageUsers: true,
          managePets: true,
          viewReports: true
        }
      });
      
      const resources = admin.getAccessibleResources();
      
      expect(resources).toContain('users');
      expect(resources).toContain('pets');
      expect(resources).toContain('reports');
      expect(resources).not.toContain('locations');
    });
    
    test('super_admin deve ter acesso a todos recursos', async () => {
      const admin = await Admin.create({
        name: 'Super Admin',
        email: 'super@admin.com',
        password: '123456',
        role: 'super_admin'
      });
      
      const resources = admin.getAccessibleResources();
      
      expect(resources).toContain('users');
      expect(resources).toContain('pets');
      expect(resources).toContain('locations');
      expect(resources).toContain('reports');
      expect(resources).toContain('admins');
    });
    
    test('canManageUser deve verificar se pode gerenciar usuário', async () => {
      const admin = await Admin.create({
        name: 'Teste Admin',
        email: 'teste@admin.com',
        password: '123456',
        role: 'admin',
        permissions: { manageUsers: true }
      });
      
      expect(admin.canManageUser('qualquer_id')).toBe(true);
      
      const adminSemPermissao = await Admin.create({
        name: 'Sem Permissão',
        email: 'sem@admin.com',
        password: '123456',
        role: 'admin',
        permissions: { manageUsers: false }
      });
      
      expect(adminSemPermissao.canManageUser('qualquer_id')).toBe(false);
    });
  });
});

console.log('✅ Todos os testes do Model Admin passaram!');
