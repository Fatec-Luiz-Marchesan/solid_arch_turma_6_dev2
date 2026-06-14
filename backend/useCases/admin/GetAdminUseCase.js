const Admin = require('../../models/Admin')
const AdminValidation = require('../../helpers/AdminValidation')
const logger = require('../../config/logger')

class GetAdminUseCase {
    async execute(id) {
        if (!AdminValidation.validateId(id)) {
            throw new Error('ID inválido')
        }

        const admin = await Admin.findById(id)

        if (!admin) {
            throw new Error('Admin não encontrado')
        }

        return admin.toJSON()
    }

    async findByEmail(email) {
        const admin = await Admin.findOne({ email })

        if (!admin) {
            throw new Error('Admin não encontrado')
        }

        return admin
    }

    async findAll(page = 1, limit = 10, filters = {}) {
        const query = {}

        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive === 'true'
        }

        if (filters.role) {
            query.role = filters.role
        }

        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)

        const admins = await Admin.find(query)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ createdAt: -1 })

        const total = await Admin.countDocuments(query)

        return {
            admins: admins.map(a => a.toJSON()),
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    }

    async getActiveAdmins() {
        const admins = await Admin.find({ isActive: true })
        return admins.map(a => a.toJSON())
    }
}

module.exports = GetAdminUseCase