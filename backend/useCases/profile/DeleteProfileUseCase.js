const Profile = require('../../models/Profile')
const ProfileValidation = require('../../helpers/profileValidation')
const logger = require('../../config/logger')

class DeleteProfileUseCase {
    async execute(id) {
        if (!ProfileValidation.validateId(id)) {
            throw new Error('ID inválido')
        }

        const profile = await Profile.findByIdAndDelete(id)
        if (!profile) {
            throw new Error('Profile não encontrado')
        }

        logger.info(`Profile deletado: ${id}`)

        return { message: 'Profile deletado com sucesso' }
    }

    async deleteByUserId(userId) {
        if (!ProfileValidation.validateId(userId)) {
            throw new Error('userId inválido')
        }

        const profile = await Profile.findOneAndDelete({ userId })
        if (!profile) {
            throw new Error('Profile não encontrado para este usuário')
        }

        logger.info(`Profile deletado para userId: ${userId}`)

        return { message: 'Profile deletado com sucesso' }
    }
}

module.exports = DeleteProfileUseCase