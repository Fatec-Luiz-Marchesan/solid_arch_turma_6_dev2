const Admin = require('../models/Admin')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const logger = require('../config/logger')
const validator = require('validator')
const { getCacheAdapter } = require('../adapters/cache')

class AdminController {
    async createAdmin(req, res) {
        try {
            let { name, email, password, role, permissions } = req.body

            if (!name || !email || !password) {
                return res.status(422).json({ message: 'Os campos name, email e password são obrigatórios' })
            }

            name = String(name).trim()
            email = String(email).trim().toLowerCase()

            if (!validator.isEmail(email)) {
                return res.status(422).json({ message: 'Email inválido' })
            }

            if (password.length < 6) {
                return res.status(422).json({ message: 'A senha deve ter no mínimo 6 caracteres' })
            }

            const existingAdmin = await Admin.findOne({ email })
            if (existingAdmin) {
                return res.status(409).json({ message: 'Admin já cadastrado com este email' })
            }

            const salt = await bcrypt.genSalt(12)
            const passwordHash = await bcrypt.hash(password, salt)

            const admin = new Admin({
                name,
                email,
                password: passwordHash,
                role: role || 'admin',
                permissions: permissions || {
                    manageUsers: false,
                    managePets: false,
                    manageLocations: false,
                    viewReports: false,
                    manageAdmins: false
                }
            })

            await admin.save()
            logger.info(`Admin criado: ${email}`)

            const cache = await getCacheAdapter()
            await cache.clear()

            res.status(201).json({
                message: 'Admin criado com sucesso',
                admin: admin.toJSON()
            })
        } catch (error) {
            logger.error(`Erro ao criar admin: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async loginAdmin(req, res) {
        try {
            let { email, password } = req.body

            if (!email || !password) {
                return res.status(422).json({ message: 'Email e senha são obrigatórios' })
            }

            email = String(email).trim().toLowerCase()

            const admin = await Admin.findOne({ email })
            if (!admin) {
                return res.status(401).json({ message: 'Email ou senha inválidos' })
            }

            if (!admin.isActive) {
                return res.status(403).json({ message: 'Conta desativada. Contate o administrador' })
            }

            const checkPassword = await bcrypt.compare(password, admin.password)
            if (!checkPassword) {
                return res.status(401).json({ message: 'Email ou senha inválidos' })
            }

            admin.lastLogin = new Date()
            await admin.save()

            const token = jwt.sign(
                { id: admin._id, email: admin.email, role: admin.role },
                process.env.JWT_SECRET || 'secret123',
                { expiresIn: '8h' }
            )

            logger.info(`Admin logado: ${email}`)

            res.status(200).json({
                message: 'Login realizado com sucesso',
                token,
                admin: admin.toJSON()
            })
        } catch (error) {
            logger.error(`Erro no login: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async getAllAdmins(req, res) {
        try {
            const { page = 1, limit = 10, active } = req.query
            const chaveCache = `admins:${page}:${limit}:${active || 'todos'}`

            const cache = await getCacheAdapter()
            const adminsCache = await cache.get(chaveCache)

            if (adminsCache) {
                return res.status(200).json(adminsCache)
            }

            const query = {}
            if (active !== undefined) {
                query.isActive = active === 'true'
            }

            const pageNum = parseInt(page, 10)
            const limitNum = parseInt(limit, 10)

            const admins = await Admin.find(query)
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .sort({ createdAt: -1 })

            const total = await Admin.countDocuments(query)

            const resposta = {
                admins: admins.map(admin => admin.toJSON()),
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum)
            }

            await cache.set(chaveCache, resposta, 300)

            return res.status(200).json(resposta)
        } catch (error) {
            logger.error(`Erro ao listar admins: ${error.message}`)
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async getAdminById(req, res) {
        try {
            const { id } = req.params

            if (!id) {
                return res.status(422).json({ message: 'ID é obrigatório' })
            }

            if (!id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(422).json({ message: 'ID inválido' })
            }

            const chaveCache = `admin:${id}`
            const cache = await getCacheAdapter()
            const adminCache = await cache.get(chaveCache)

            if (adminCache) {
                return res.status(200).json(adminCache)
            }

            const admin = await Admin.findById(id)

            if (!admin) {
                return res.status(404).json({ message: 'Admin não encontrado' })
            }

            const resposta = admin.toJSON()
            await cache.set(chaveCache, resposta, 600)

            return res.status(200).json(resposta)
        } catch (error) {
            logger.error(`Erro ao buscar admin: ${error.message}`)
            return res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async updateAdmin(req, res) {
        try {
            const { id } = req.params
            const { name, role, permissions, isActive } = req.body

            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(422).json({ message: 'ID inválido' })
            }

            const admin = await Admin.findById(id)
            if (!admin) {
                return res.status(404).json({ message: 'Admin não encontrado' })
            }

            if (name) admin.name = String(name).trim()
            if (role && ['admin', 'moderator'].includes(role)) {
                admin.role = role
            }
            if (permissions) {
                const allowedPermissions = ['manageUsers', 'managePets', 'manageLocations', 'viewReports', 'manageAdmins']
                for (const [key, value] of Object.entries(permissions)) {
                    if (allowedPermissions.includes(key) && typeof value === 'boolean') {
                        admin.permissions[key] = value
                    }
                }
            }
            if (isActive !== undefined) {
                admin.isActive = isActive === true || isActive === 'true'
            }

            admin.updatedAt = new Date()
            await admin.save()

            const cache = await getCacheAdapter()
            await cache.del(`admin:${id}`)
            await cache.clear()

            logger.info(`Admin atualizado: ${admin.email}`)

            res.status(200).json({
                message: 'Admin atualizado com sucesso',
                admin: admin.toJSON()
            })
        } catch (error) {
            logger.error(`Erro ao atualizar admin: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async updatePassword(req, res) {
        try {
            const { id } = req.params
            const { currentPassword, newPassword } = req.body

            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(422).json({ message: 'ID inválido' })
            }

            if (!currentPassword || !newPassword) {
                return res.status(422).json({ message: 'Senha atual e nova senha são obrigatórias' })
            }

            if (newPassword.length < 6) {
                return res.status(422).json({ message: 'A nova senha deve ter no mínimo 6 caracteres' })
            }

            const admin = await Admin.findById(id)
            if (!admin) {
                return res.status(404).json({ message: 'Admin não encontrado' })
            }

            const checkPassword = await bcrypt.compare(currentPassword, admin.password)
            if (!checkPassword) {
                return res.status(401).json({ message: 'Senha atual incorreta' })
            }

            const salt = await bcrypt.genSalt(12)
            admin.password = await bcrypt.hash(newPassword, salt)
            admin.updatedAt = new Date()
            await admin.save()

            logger.info(`Senha atualizada para admin: ${admin.email}`)

            res.status(200).json({ message: 'Senha atualizada com sucesso' })
        } catch (error) {
            logger.error(`Erro ao atualizar senha: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async deleteAdmin(req, res) {
        try {
            const { id } = req.params

            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(422).json({ message: 'ID inválido' })
            }

            const admin = await Admin.findByIdAndDelete(id)
            if (!admin) {
                return res.status(404).json({ message: 'Admin não encontrado' })
            }

            const cache = await getCacheAdapter()
            await cache.del(`admin:${id}`)
            await cache.clear()

            logger.info(`Admin deletado: ${admin.email}`)

            res.status(200).json({ message: 'Admin deletado com sucesso' })
        } catch (error) {
            logger.error(`Erro ao deletar admin: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async getDashboardStats(req, res) {
        try {
            const cache = await getCacheAdapter()
            const chaveCache = 'admin:dashboard'
            const statsCache = await cache.get(chaveCache)

            if (statsCache) {
                return res.status(200).json(statsCache)
            }

            const totalAdmins = await Admin.countDocuments()
            const activeAdmins = await Admin.countDocuments({ isActive: true })
            const inactiveAdmins = totalAdmins - activeAdmins
            const recentAdmins = await Admin.find()
                .sort({ createdAt: -1 })
                .limit(5)

            const resposta = {
                totalAdmins,
                activeAdmins,
                inactiveAdmins,
                recentAdmins: recentAdmins.map(admin => admin.toJSON()),
                timestamp: new Date().toISOString()
            }

            await cache.set(chaveCache, resposta, 1800)

            res.status(200).json(resposta)
        } catch (error) {
            logger.error(`Erro ao buscar stats: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async toggleAdminStatus(req, res) {
        try {
            const { id } = req.params

            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(422).json({ message: 'ID inválido' })
            }

            const admin = await Admin.findById(id)
            if (!admin) {
                return res.status(404).json({ message: 'Admin não encontrado' })
            }

            admin.isActive = !admin.isActive
            admin.updatedAt = new Date()
            await admin.save()

            const cache = await getCacheAdapter()
            await cache.del(`admin:${id}`)
            await cache.clear()

            logger.info(`Status do admin ${admin.email} alterado para ${admin.isActive}`)

            res.status(200).json({
                message: `Admin ${admin.isActive ? 'ativado' : 'desativado'} com sucesso`,
                isActive: admin.isActive
            })
        } catch (error) {
            logger.error(`Erro ao alterar status: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async updatePermissions(req, res) {
        try {
            const { id } = req.params
            const { permissions } = req.body

            if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
                return res.status(422).json({ message: 'ID inválido' })
            }

            if (!permissions) {
                return res.status(422).json({ message: 'Permissões são obrigatórias' })
            }

            const admin = await Admin.findById(id)
            if (!admin) {
                return res.status(404).json({ message: 'Admin não encontrado' })
            }

            const allowedPermissions = ['manageUsers', 'managePets', 'manageLocations', 'viewReports', 'manageAdmins']

            for (const [key, value] of Object.entries(permissions)) {
                if (allowedPermissions.includes(key) && typeof value === 'boolean') {
                    admin.permissions[key] = value
                }
            }

            admin.updatedAt = new Date()
            await admin.save()

            const cache = await getCacheAdapter()
            await cache.del(`admin:${id}`)

            logger.info(`Permissões atualizadas para admin: ${admin.email}`)

            res.status(200).json({
                message: 'Permissões atualizadas com sucesso',
                permissions: admin.permissions
            })
        } catch (error) {
            logger.error(`Erro ao atualizar permissões: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async clearCache(req, res) {
        try {
            const cache = await getCacheAdapter()
            await cache.clear()

            logger.info('Cache limpo manualmente')

            res.status(200).json({ message: 'Cache limpo com sucesso' })
        } catch (error) {
            logger.error(`Erro ao limpar cache: ${error.message}`)
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }
}

module.exports = new AdminController()