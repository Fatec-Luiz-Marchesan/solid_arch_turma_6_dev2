const AdminController = require('../../controllers/AdminController')
const Admin = require('../../models/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { getCacheAdapter } = require('../../adapters/cache')

jest.mock('../../models/Admin')
jest.mock('bcrypt')
jest.mock('jsonwebtoken')
jest.mock('../../adapters/cache')

describe('AdminController Unit Tests', () => {
    let req
    let res
    let mockCache

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            userId: '507f1f77bcf86cd799439011'
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        }

        mockCache = {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(true),
            del: jest.fn().mockResolvedValue(true),
            clear: jest.fn().mockResolvedValue(true)
        }
        getCacheAdapter.mockResolvedValue(mockCache)

        jest.clearAllMocks()
    })

    describe('createAdmin', () => {
        test('deve criar admin com sucesso', async () => {
            req.body = {
                name: 'João Silva',
                email: 'joao@admin.com',
                password: '123456',
                role: 'admin'
            }

            Admin.findOne.mockResolvedValue(null)
            bcrypt.genSalt.mockResolvedValue('salt')
            bcrypt.hash.mockResolvedValue('hashedPassword')
            Admin.prototype.save = jest.fn().mockResolvedValue({
                toJSON: () => ({ name: 'João Silva', email: 'joao@admin.com' })
            })

            await AdminController.createAdmin(req, res)

            expect(mockCache.clear).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(201)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Admin criado com sucesso'
                })
            )
        })

        test('deve retornar erro quando campos obrigatórios faltam', async () => {
            req.body = { name: 'João Silva' }

            await AdminController.createAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Os campos name, email e password são obrigatórios'
                })
            )
        })

        test('deve retornar erro quando email é inválido', async () => {
            req.body = {
                name: 'João Silva',
                email: 'emailinvalido',
                password: '123456'
            }

            await AdminController.createAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Email inválido'
                })
            )
        })

        test('deve retornar erro quando senha é muito curta', async () => {
            req.body = {
                name: 'João Silva',
                email: 'joao@admin.com',
                password: '123'
            }

            await AdminController.createAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'A senha deve ter no mínimo 6 caracteres'
                })
            )
        })

        test('deve retornar erro quando admin já existe', async () => {
            req.body = {
                name: 'João Silva',
                email: 'joao@admin.com',
                password: '123456'
            }

            Admin.findOne.mockResolvedValue({ email: 'joao@admin.com' })

            await AdminController.createAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(409)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Admin já cadastrado com este email'
                })
            )
        })
    })

    describe('loginAdmin', () => {
        test('deve realizar login com sucesso', async () => {
            req.body = {
                email: 'joao@admin.com',
                password: '123456'
            }

            const mockAdmin = {
                _id: '507f1f77bcf86cd799439011',
                email: 'joao@admin.com',
                password: 'hashedPassword',
                isActive: true,
                toJSON: () => ({ email: 'joao@admin.com' }),
                save: jest.fn().mockResolvedValue(true)
            }

            Admin.findOne.mockResolvedValue(mockAdmin)
            bcrypt.compare.mockResolvedValue(true)
            jwt.sign.mockReturnValue('fake-token')

            await AdminController.loginAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Login realizado com sucesso',
                    token: 'fake-token'
                })
            )
        })

        test('deve retornar erro quando email ou senha faltam', async () => {
            req.body = { email: 'joao@admin.com' }

            await AdminController.loginAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Email e senha são obrigatórios'
                })
            )
        })

        test('deve retornar erro quando admin não existe', async () => {
            req.body = {
                email: 'naoexiste@admin.com',
                password: '123456'
            }

            Admin.findOne.mockResolvedValue(null)

            await AdminController.loginAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Email ou senha inválidos'
                })
            )
        })

        test('deve retornar erro quando admin está inativo', async () => {
            req.body = {
                email: 'joao@admin.com',
                password: '123456'
            }

            Admin.findOne.mockResolvedValue({
                email: 'joao@admin.com',
                isActive: false
            })

            await AdminController.loginAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(403)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Conta desativada. Contate o administrador'
                })
            )
        })

        test('deve retornar erro quando senha está incorreta', async () => {
            req.body = {
                email: 'joao@admin.com',
                password: 'senhaerrada'
            }

            Admin.findOne.mockResolvedValue({
                email: 'joao@admin.com',
                password: 'hashedPassword',
                isActive: true
            })
            bcrypt.compare.mockResolvedValue(false)

            await AdminController.loginAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(401)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Email ou senha inválidos'
                })
            )
        })
    })

    describe('getAllAdmins', () => {
        test('deve listar admins com paginação', async () => {
            req.query = { page: 1, limit: 10 }

            const mockAdmins = [{ toJSON: () => ({ id: '1', name: 'Admin1' }) }]

            Admin.find.mockReturnValue({
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockAdmins)
            })
            Admin.countDocuments.mockResolvedValue(1)

            await AdminController.getAllAdmins(req, res)

            expect(mockCache.get).toHaveBeenCalledWith('admins:1:10:todos')
            expect(mockCache.set).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    total: 1,
                    page: 1,
                    pages: 1
                })
            )
        })

        test('deve retornar dados do cache quando disponivel', async () => {
            req.query = { page: 1, limit: 10 }
            const cachedData = { admins: [], total: 0, page: 1, pages: 0 }
            mockCache.get.mockResolvedValue(cachedData)

            await AdminController.getAllAdmins(req, res)

            expect(Admin.find).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(cachedData)
        })
    })

    describe('getAdminById', () => {
        test('deve buscar admin por ID com sucesso', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }

            const adminMock = {
                toJSON: () => ({ id: '507f1f77bcf86cd799439011', name: 'João Silva' })
            }

            Admin.findById.mockResolvedValue(adminMock)

            await AdminController.getAdminById(req, res)

            expect(mockCache.get).toHaveBeenCalled()
            expect(mockCache.set).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'João Silva'
                })
            )
        })

        test('deve retornar erro para ID inválido', async () => {
            req.params = { id: 'id-invalido' }

            await AdminController.getAdminById(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'ID inválido'
                })
            )
        })

        test('deve retornar erro quando ID não fornecido', async () => {
            req.params = { id: undefined }

            await AdminController.getAdminById(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'ID é obrigatório'
                })
            )
        })

        test('deve retornar 404 quando admin não encontrado', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }

            Admin.findById.mockResolvedValue(null)

            await AdminController.getAdminById(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Admin não encontrado'
                })
            )
        })

        test('deve retornar do cache quando disponivel', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }
            const cachedAdmin = { id: '507f1f77bcf86cd799439011', name: 'Admin Cache' }
            mockCache.get.mockResolvedValue(cachedAdmin)

            await AdminController.getAdminById(req, res)

            expect(Admin.findById).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(cachedAdmin)
        })
    })

    describe('updateAdmin', () => {
        test('deve atualizar admin com sucesso', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }
            req.body = { name: 'Nome Atualizado', isActive: false }

            const mockAdmin = {
                name: 'Nome Original',
                email: 'joao@admin.com',
                save: jest.fn().mockResolvedValue(true),
                toJSON: () => ({ name: 'Nome Atualizado', email: 'joao@admin.com' })
            }

            Admin.findById.mockResolvedValue(mockAdmin)

            await AdminController.updateAdmin(req, res)

            expect(mockCache.del).toHaveBeenCalledWith('admin:507f1f77bcf86cd799439011')
            expect(mockCache.clear).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Admin atualizado com sucesso'
                })
            )
        })

        test('deve retornar 404 quando admin não encontrado', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }
            req.body = { name: 'Atualizado' }

            Admin.findById.mockResolvedValue(null)

            await AdminController.updateAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
        })
    })

    describe('deleteAdmin', () => {
        test('deve deletar admin com sucesso', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }

            Admin.findByIdAndDelete.mockResolvedValue({ email: 'joao@admin.com' })

            await AdminController.deleteAdmin(req, res)

            expect(mockCache.del).toHaveBeenCalledWith('admin:507f1f77bcf86cd799439011')
            expect(mockCache.clear).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Admin deletado com sucesso'
                })
            )
        })

        test('deve retornar erro para ID inválido', async () => {
            req.params = { id: 'id-invalido' }

            await AdminController.deleteAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'ID inválido'
                })
            )
        })

        test('deve retornar 404 quando admin não encontrado', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }

            Admin.findByIdAndDelete.mockResolvedValue(null)

            await AdminController.deleteAdmin(req, res)

            expect(res.status).toHaveBeenCalledWith(404)
        })
    })

    describe('getDashboardStats', () => {
        test('deve retornar estatísticas do dashboard', async () => {
            Admin.countDocuments.mockResolvedValueOnce(10)
            Admin.countDocuments.mockResolvedValueOnce(8)
            Admin.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockResolvedValue([{ toJSON: () => ({}) }])
                })
            })

            await AdminController.getDashboardStats(req, res)

            expect(mockCache.get).toHaveBeenCalledWith('admin:dashboard')
            expect(mockCache.set).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    totalAdmins: 10,
                    activeAdmins: 8
                })
            )
        })

        test('deve retornar stats do cache quando disponivel', async () => {
            const cachedStats = { totalAdmins: 5, activeAdmins: 3, inactiveAdmins: 2 }
            mockCache.get.mockResolvedValue(cachedStats)

            await AdminController.getDashboardStats(req, res)

            expect(Admin.countDocuments).not.toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(cachedStats)
        })
    })

    describe('toggleAdminStatus', () => {
        test('deve alternar status do admin', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }

            const mockAdmin = {
                isActive: true,
                email: 'joao@admin.com',
                save: jest.fn().mockResolvedValue(true)
            }

            Admin.findById.mockResolvedValue(mockAdmin)

            await AdminController.toggleAdminStatus(req, res)

            expect(mockCache.del).toHaveBeenCalledWith('admin:507f1f77bcf86cd799439011')
            expect(mockCache.clear).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    isActive: false
                })
            )
        })
    })

    describe('updatePermissions', () => {
        test('deve atualizar permissões do admin', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }
            req.body = {
                permissions: {
                    manageUsers: true,
                    viewReports: true
                }
            }

            const mockAdmin = {
                permissions: {
                    manageUsers: false,
                    managePets: false,
                    manageLocations: false,
                    viewReports: false,
                    manageAdmins: false
                },
                email: 'joao@admin.com',
                save: jest.fn().mockResolvedValue(true)
            }

            Admin.findById.mockResolvedValue(mockAdmin)

            await AdminController.updatePermissions(req, res)

            expect(mockCache.del).toHaveBeenCalledWith('admin:507f1f77bcf86cd799439011')
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Permissões atualizadas com sucesso'
                })
            )
        })

        test('deve retornar erro quando permissões não são fornecidas', async () => {
            req.params = { id: '507f1f77bcf86cd799439011' }
            req.body = {}

            await AdminController.updatePermissions(req, res)

            expect(res.status).toHaveBeenCalledWith(422)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Permissões são obrigatórias'
                })
            )
        })
    })

    describe('clearCache', () => {
        test('deve limpar cache com sucesso', async () => {
            await AdminController.clearCache(req, res)

            expect(mockCache.clear).toHaveBeenCalled()
            expect(res.status).toHaveBeenCalledWith(200)
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Cache limpo com sucesso'
                })
            )
        })
    })
})

console.log('Testes do AdminController corrigidos e prontos para Redis Cache!')