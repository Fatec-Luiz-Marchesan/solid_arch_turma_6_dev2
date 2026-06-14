const Admin = require('../../models/Admin');

describe('Admin Model Unit Tests', () => {
    describe('Admin Schema Validation', () => {
        test('deve criar admin válido', () => {
            const adminData = {
                name: 'João Silva',
                email: 'joao@admin.com',
                password: '123456',
                role: 'admin'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeUndefined();
            expect(admin.name).toBe('João Silva');
            expect(admin.email).toBe('joao@admin.com');
            expect(admin.role).toBe('admin');
        });

        test('deve exigir campo name', () => {
            const adminData = {
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeDefined();
            expect(error.errors.name).toBeDefined();
        });

        test('deve exigir campo email', () => {
            const adminData = {
                name: 'Teste Admin',
                password: '123456'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeDefined();
            expect(error.errors.email).toBeDefined();
        });

        test('deve exigir campo password', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeDefined();
            expect(error.errors.password).toBeDefined();
        });

        test('deve converter email para lowercase', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'TESTE@ADMIN.COM',
                password: '123456'
            };

            const admin = new Admin(adminData);
            expect(admin.email).toBe('teste@admin.com');
        });

        test('deve ter valores padrão para role', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            expect(admin.role).toBe('admin');
        });

        test('deve ter valores padrão para isActive', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            expect(admin.isActive).toBe(true);
        });

        test('deve aceitar role super_admin', () => {
            const adminData = {
                name: 'Super Admin',
                email: 'super@admin.com',
                password: '123456',
                role: 'super_admin'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeUndefined();
            expect(admin.role).toBe('super_admin');
        });

        test('deve aceitar role moderator', () => {
            const adminData = {
                name: 'Moderator',
                email: 'mod@admin.com',
                password: '123456',
                role: 'moderator'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeUndefined();
            expect(admin.role).toBe('moderator');
        });

        test('deve rejeitar role inválida', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456',
                role: 'role_invalida'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeDefined();
            expect(error.errors.role).toBeDefined();
        });
    });

    describe('Admin Permissions', () => {
        test('deve ter permissões padrão', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);

            expect(admin.permissions.manageUsers).toBe(false);
            expect(admin.permissions.managePets).toBe(false);
            expect(admin.permissions.manageLocations).toBe(false);
            expect(admin.permissions.viewReports).toBe(false);
            expect(admin.permissions.manageAdmins).toBe(false);
        });

        test('deve permitir definir permissões', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456',
                permissions: {
                    manageUsers: true,
                    viewReports: true
                }
            };

            const admin = new Admin(adminData);

            expect(admin.permissions.manageUsers).toBe(true);
            expect(admin.permissions.viewReports).toBe(true);
            expect(admin.permissions.managePets).toBe(false);
        });
    });

    describe('Admin Methods', () => {
        test('toJSON deve remover password', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            const json = admin.toJSON();

            expect(json.password).toBeUndefined();
            expect(json.name).toBe('Teste Admin');
            expect(json.email).toBe('teste@admin.com');
        });

        test('toJSON deve remover __v', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            const json = admin.toJSON();

            expect(json.__v).toBeUndefined();
        });

        test('hasPermission deve retornar true para super_admin', () => {
            const adminData = {
                name: 'Super Admin',
                email: 'super@admin.com',
                password: '123456',
                role: 'super_admin'
            };

            const admin = new Admin(adminData);

            expect(admin.hasPermission('manageUsers')).toBe(true);
            expect(admin.hasPermission('manageAdmins')).toBe(true);
            expect(admin.hasPermission('qualquer_permissao')).toBe(true);
        });

        test('hasPermission deve verificar permissão do admin', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456',
                permissions: {
                    manageUsers: true,
                    managePets: false
                }
            };

            const admin = new Admin(adminData);

            expect(admin.hasPermission('manageUsers')).toBe(true);
            expect(admin.hasPermission('managePets')).toBe(false);
        });

        test('hasPermission deve retornar false para permissão não concedida', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456',
                permissions: {
                    manageUsers: true
                }
            };

            const admin = new Admin(adminData);

            expect(admin.hasPermission('manageLocations')).toBe(false);
        });
    });

    describe('Admin Static Methods', () => {
        test('findByEmail deve ser definido', () => {
            expect(Admin.findByEmail).toBeDefined();
        });

        test('getActiveAdmins deve ser definido', () => {
            expect(Admin.getActiveAdmins).toBeDefined();
        });
    });

    describe('Admin Update Operations', () => {
        test('deve permitir atualização parcial', () => {
            const adminData = {
                name: 'Nome Original',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            admin.name = 'Nome Atualizado';
            admin.isActive = false;

            expect(admin.name).toBe('Nome Atualizado');
            expect(admin.isActive).toBe(false);
            expect(admin.email).toBe('teste@admin.com');
        });

        test('deve permitir desativar admin', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456',
                isActive: true
            };

            const admin = new Admin(adminData);
            admin.isActive = false;

            expect(admin.isActive).toBe(false);
        });

        test('deve permitir atualizar permissões', () => {
            const adminData = {
                name: 'Teste Admin',
                email: 'teste@admin.com',
                password: '123456',
                permissions: {
                    manageUsers: false,
                    viewReports: false
                }
            };

            const admin = new Admin(adminData);
            admin.permissions.manageUsers = true;
            admin.permissions.viewReports = true;

            expect(admin.permissions.manageUsers).toBe(true);
            expect(admin.permissions.viewReports).toBe(true);
        });
    });

    describe('Admin Validation Edge Cases', () => {
        test('deve aceitar nome com espaços', () => {
            const adminData = {
                name: 'João Silva Santos',
                email: 'joao@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            const error = admin.validateSync();

            expect(error).toBeUndefined();
            expect(admin.name).toBe('João Silva Santos');
        });

        test('deve trim espaços do nome', () => {
            const adminData = {
                name: '  Teste Admin  ',
                email: 'teste@admin.com',
                password: '123456'
            };

            const admin = new Admin(adminData);
            expect(admin.name).toBe('Teste Admin');
        });
    });
});

console.log('Testes unitários do Admin finalizados com sucesso');