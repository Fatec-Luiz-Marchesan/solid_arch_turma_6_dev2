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
        } else if (data.meals.length > 10) {
            errors.push('máximo de 10 refeições por dia')
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
            if (data.meals.length > 10) {
                errors.push('máximo de 10 refeições por dia')
            } else {
                for (let i = 0; i < data.meals.length; i++) {
                    const mealValidation = this.validateMeal(data.meals[i])
                    if (!mealValidation.isValid) {
                        errors.push(`Refeição ${i + 1}: ${mealValidation.errors.join(', ')}`)
                    }
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
function validateNewFields(data) {
    const errors = []
    
    if (data.waterIntake) {
        if (data.waterIntake.recommended < 0) {
            errors.push('Quantidade de água não pode ser negativa')
        }
        if (data.waterIntake.recommended > 5000) {
            errors.push('Quantidade de água muito alta (máximo 5000ml)')
        }
    }
    
    if (data.nutritionalGoals) {
        const hasGoal = data.nutritionalGoals.weightGain || 
                        data.nutritionalGoals.weightLoss || 
                        data.nutritionalGoals.maintenance
        if (!hasGoal) {
            errors.push('Pelo menos um objetivo nutricional deve ser selecionado')
        }
    }
    
    if (data.weeklyMenu && data.weeklyMenu.length > 7) {
        errors.push('Menu semanal não pode ter mais de 7 dias')
    }
    
    if (data.dietaryRestrictions && data.dietaryRestrictions.length > 10) {
        errors.push('Máximo de 10 restrições alimentares')
    }
    
    if (data.supplements && data.supplements.length > 15) {
        errors.push('Máximo de 15 suplementos')
    }
    
    return { isValid: errors.length === 0, errors }
}

module.exports.validateNewFields = validateNewFields
