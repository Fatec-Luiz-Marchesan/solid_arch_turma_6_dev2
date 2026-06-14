const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')
const logger = require('../../config/logger')

class CreateDietUseCase {
    async execute(data) {
        const validation = DietValidation.validateCreate(data)
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const diet = new Diet(data)
        await diet.save()
        
        logger.info(`Dieta criada para petId: ${data.petId}`)
        
        return diet.toJSON()
    }
}

module.exports = CreateDietUseCase