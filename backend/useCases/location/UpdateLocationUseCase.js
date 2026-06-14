const Location = require('../../models/Location')
const LocationValidation = require('../../helpers/locationValidation')
const logger = require('../../config/logger')

class UpdateLocationUseCase {
    async execute(id, data) {
        if (!LocationValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const validation = LocationValidation.validateUpdate(data)
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const location = await Location.findById(id)
        
        if (!location) {
            throw new Error('Localização não encontrada')
        }
        
        const allowed = ['latitude', 'longitude', 'address', 'isCurrent']
        
        for (const field of allowed) {
            if (data[field] !== undefined) {
                if (field === 'address') {
                    location.address = { ...location.address, ...data.address }
                } else {
                    location[field] = data[field]
                }
            }
        }
        
        await location.save()
        
        logger.info(`Localização atualizada: ${id}`)
        
        return location.toJSON()
    }
}

module.exports = UpdateLocationUseCase