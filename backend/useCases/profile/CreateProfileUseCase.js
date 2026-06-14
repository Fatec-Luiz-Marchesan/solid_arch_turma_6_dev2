const Profile = require('../../models/Profile')
const ProfileValidation = require('../../helpers/profileValidation')
const logger = require('../../config/logger')

class CreateProfileUseCase {
    async execute(data) {
        const validation = ProfileValidation.validateCreate(data)
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }

        const existing = await Profile.findOne({ userId: data.userId })
        if (existing) {
            throw new Error('Profile já existe para este usuário')
        }

        const profile = new Profile(data)
        await profile.save()

        logger.info(`Profile criado para userId: ${data.userId}`)

        return profile.toJSON()
    }
}

module.exports = CreateProfileUseCase