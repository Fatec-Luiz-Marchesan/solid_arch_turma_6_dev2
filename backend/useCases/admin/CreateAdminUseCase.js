const Admin = require('../../models/Admin')
const AdminValidation = require('../../helpers/AdminValidation')
const logger = require('../../config/logger')

class CreateAdminUseCase {
    async execute(data) {
        const validation = AdminValidation.validateCreate(data)

        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }

        const existing = await Admin.findOne({ email: data.email })

        if (existing) {
            throw new Error('Email já cadastrado')
        }

        const admin = new Admin(data)
        await admin.save()

        logger.info(`Admin criado: ${data.email}`)

        return admin.toJSON()
    }
}

module.exports = CreateAdminUseCase