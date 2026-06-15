const mongoose = require('mongoose')
const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')
const logger = require('../../config/logger')

class CreateDietUseCase {
    async execute(data) {
        if (!mongoose.Types.ObjectId.isValid(data.petId)) {
            throw new Error('petId inválido')
        }
        
        const validation = DietValidation.validateCreate(data)
        if (!validation.isValid) {
            throw new Error(validation.errors.join(', '))
        }
        
        const newFieldsValidation = DietValidation.validateNewFields(data)
        if (!newFieldsValidation.isValid) {
            throw new Error(newFieldsValidation.errors.join(', '))
        }
        
        const activeDiet = await Diet.findOne({ 
            petId: data.petId, 
            isActive: true 
        })
        
        if (activeDiet && data.isActive !== false) {
            throw new Error('Pet já possui uma dieta ativa')
        }
        
        const diet = new Diet(data)
        await diet.save()
        
        logger.info(`Dieta criada para petId: ${data.petId}`)
        
        return {
            ...diet.toJSON(),
            message: 'Dieta criada com sucesso',
            stats: this.calculateDailySummary(diet)
        }
    }
    
    calculateDailySummary(diet) {
        const meals = diet.meals || []
        const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
        
        return {
            totalCalories,
            mealsCount: meals.length,
            schedule: meals.map(m => ({ name: m.name, time: m.time }))
        }
    }
}

module.exports = CreateDietUseCase
