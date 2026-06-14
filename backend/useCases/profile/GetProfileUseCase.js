const Profile = require('../../models/Profile')
const ProfileValidation = require('../../helpers/profileValidation')
const logger = require('../../config/logger')

class GetProfileUseCase {
    async execute(id) {
        if (!ProfileValidation.validateId(id)) {
            throw new Error('ID inválido')
        }

        const profile = await Profile.findById(id).populate('userId', 'name email')

        if (!profile) {
            throw new Error('Profile não encontrado')
        }

        return profile.toJSON()
    }

    async findByUserId(userId) {
        if (!ProfileValidation.validateId(userId)) {
            throw new Error('userId inválido')
        }

        const profile = await Profile.findOne({ userId }).populate('userId', 'name email')

        if (!profile) {
            throw new Error('Profile não encontrado para este usuário')
        }

        return profile.toJSON()
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }

    async findAll(filters = {}, page = 1, limit = 10) {
        const query = {}

        if (filters.isPublic !== undefined) {
            query.isPublic = filters.isPublic === 'true'
        }

        if (filters.city) {
            const sanitizedCity = this.escapeRegExp(filters.city)
            query['address.city'] = new RegExp(sanitizedCity, 'i')
        }

        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)

        const profiles = await Profile.find(query)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')

        const total = await Profile.countDocuments(query)

        return {
            profiles: profiles.map(p => p.toJSON()),
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    }
}

module.exports = GetProfileUseCase