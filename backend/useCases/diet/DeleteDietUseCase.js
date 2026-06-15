const mongoose = require('mongoose')
const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')
const logger = require('../../config/logger')

class DeleteDietUseCase {
    async execute(id) {
        if (!DietValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const diet = await Diet.findByIdAndDelete(id)
        
        if (!diet) {
            throw new Error('Dieta não encontrada')
        }
        
        logger.info(`Dieta deletada: ${id}`)
        
        return { message: 'Dieta deletada com sucesso' }
    }
}

module.exports = DeleteDietUseCase
