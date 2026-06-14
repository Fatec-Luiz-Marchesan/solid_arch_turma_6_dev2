const Location = require('../../models/Location')
const LocationValidation = require('../../helpers/locationValidation')
const logger = require('../../config/logger')

class CreateLocationUseCase {
    async execute(data) {
        const validation = LocationValidation.validateCreate(data)
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const petIdRegex = /^[0-9a-fA-F]{24}$/
        if (!petIdRegex.test(data.petId)) {
            throw new Error('petId inválido')
        }
        
        const existing = await Location.findOne({ petId: { $eq: data.petId } })
        
        if (existing) {
            throw new Error('Localização já existe para este pet')
        }
        
        const location = new Location(data)
        await location.save()
        
        logger.info(`Localização criada para petId: ${data.petId}`)
        
        return location.toJSON()
    }
}

module.exports = CreateLocationUseCase