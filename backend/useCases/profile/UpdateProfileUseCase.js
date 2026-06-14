const Profile = require('../../models/Profile')
const ProfileValidation = require('../../helpers/profileValidation')
const logger = require('../../config/logger')

class UpdateProfileUseCase {
    async execute(id, data) {
        if (!ProfileValidation.validateId(id)) {
            throw new Error('ID inválido')
        }

        const validation = ProfileValidation.validateUpdate(data)
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }

        const profile = await Profile.findById(id)
        if (!profile) {
            throw new Error('Profile não encontrado')
        }

        const allowed = ['fullName', 'bio', 'avatar', 'phone', 'address', 'socialLinks', 'preferences', 'isPublic']

        allowed.forEach(field => {
            if (data[field] !== undefined) {
                if (field === 'address' || field === 'socialLinks' || field === 'preferences') {
                    profile[field] = { ...profile[field], ...data[field] }
                } else {
                    profile[field] = data[field]
                }
            }
        })

        await profile.save()

        logger.info(`Profile atualizado: ${id}`)

        return profile.toJSON()
    }
}

module.exports = UpdateProfileUseCase