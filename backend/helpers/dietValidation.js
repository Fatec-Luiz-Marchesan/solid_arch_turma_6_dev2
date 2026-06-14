class DietValidation {
    static validateMeal(meal) {
        const errors = []
        
        if (!meal.name) {
            errors.push('nome da refeição é obrigatório')
        } else if (meal.name.length < 3) {
            errors.push('nome deve ter no mínimo 3 caracteres')
        }
        
        if (!meal.time) {
            errors.push('horário da refeição é obrigatório')
        } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(meal.time)) {
            errors.push('horário inválido, use formato HH:MM')
        }
        
        if (meal.calories && meal.calories < 0) {
            errors.push('calorias não podem ser negativas')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateCreate(data) {
        const errors = []
        
        if (!data.petId) {
            errors.push('petId é obrigatório')
        }
        
        if (!data.meals || data.meals.length === 0) {
            errors.push('pelo menos uma refeição é obrigatória')
        } else {
            for (let i = 0; i < data.meals.length; i++) {
                const mealValidation = this.validateMeal(data.meals[i])
                if (!mealValidation.isValid) {
                    errors.push(`Refeição ${i + 1}: ${mealValidation.errors.join(', ')}`)
                }
            }
        }
        
        if (data.observations && data.observations.length > 500) {
            errors.push('observações deve ter no máximo 500 caracteres')
        }
        
        if (data.endDate && data.endDate < data.startDate) {
            errors.push('data final não pode ser anterior à data inicial')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateUpdate(data) {
        const errors = []
        
        if (data.meals && data.meals.length > 0) {
            for (let i = 0; i < data.meals.length; i++) {
                const mealValidation = this.validateMeal(data.meals[i])
                if (!mealValidation.isValid) {
                    errors.push(`Refeição ${i + 1}: ${mealValidation.errors.join(', ')}`)
                }
            }
        }
        
        if (data.observations && data.observations.length > 500) {
            errors.push('observações deve ter no máximo 500 caracteres')
        }
        
        if (data.endDate && data.startDate && data.endDate < data.startDate) {
            errors.push('data final não pode ser anterior à data inicial')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateId(id) {
        return id && /^[0-9a-fA-F]{24}$/.test(id)
    }
}

module.exports = DietValidation