const Admin = require('../../models/Admin')
const AdminValidation = require('../../helpers/AdminValidation')
const bcrypt = require('bcrypt')
const logger = require('../../config/logger')

class UpdateAdminUseCase {
    async execute(id, data) {
        if (!AdminValidation.validateId(id)) {
            throw new Error('ID inválido')
        }

        const validation = AdminValidation.validateUpdate(data)

        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }

        const admin = await Admin.findById(id)

        if (!admin) {
            throw new Error('Admin não encontrado')
        }

        const allowed = ['name', 'email', 'role', 'isActive', 'permissions']

        for (const field of allowed) {
            if (data[field] !== undefined) {
                if (field === 'permissions') {
                    admin.permissions = { ...admin.permissions, ...data.permissions }
                } else {
                    admin[field] = data[field]
                }
            }
        }

        if (data.password) {
            const salt = await bcrypt.genSalt(12)
            admin.password = await bcrypt.hash(data.password, salt)
        }

        await admin.save()

        logger.info(`Admin atualizado: ${admin.email}`)

        return admin.toJSON()
    }
}

module.exports = UpdateAdminUseCase