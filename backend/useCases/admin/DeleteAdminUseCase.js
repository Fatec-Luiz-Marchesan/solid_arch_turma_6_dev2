const Admin = require('../../models/Admin')
const AdminValidation = require('../../helpers/AdminValidation')
const logger = require('../../config/logger')

class DeleteAdminUseCase {
    async execute(id) {
        if (!AdminValidation.validateId(id)) {
            throw new Error('ID inválido')
        }

        const admin = await Admin.findByIdAndDelete(id)

        if (!admin) {
            throw new Error('Admin não encontrado')
        }

        logger.info(`Admin deletado: ${admin.email}`)

        return { message: 'Admin deletado com sucesso' }
    }
}

module.exports = DeleteAdminUseCase