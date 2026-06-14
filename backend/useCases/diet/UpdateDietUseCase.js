const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')
const logger = require('../../config/logger')

class UpdateDietUseCase {
    async execute(id, data) {
        if (!DietValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const validation = DietValidation.validateUpdate(data)
        
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const diet = await Diet.findById(id)
        
        if (!diet) {
            throw new Error('Dieta não encontrada')
        }
        
        const allowed = ['meals', 'restrictions', 'observations', 'endDate', 'isActive']
        
        for (const field of allowed) {
            if (data[field] !== undefined) {
                diet[field] = data[field]
            }
        }
        
        await diet.save()
        
        logger.info(`Dieta atualizada: ${id}`)
        
        return diet.toJSON()
    }
}

module.exports = UpdateDietUseCase