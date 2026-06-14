const Location = require('../../models/Location')
const LocationValidation = require('../../helpers/locationValidation')
const logger = require('../../config/logger')

class DeleteLocationUseCase {
    async execute(id) {
        if (!LocationValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const location = await Location.findByIdAndDelete(id)
        
        if (!location) {
            throw new Error('Localização não encontrada')
        }
        
        logger.info(`Localização deletada: ${id}`)
        
        return { message: 'Localização deletada com sucesso' }
    }
}

module.exports = DeleteLocationUseCase