class ProfileValidation {
    static validateCreate(data) {
        const errors = []

        if (!data.userId) {
            errors.push('userId é obrigatório')
        }

        if (!data.fullName) {
            errors.push('fullName é obrigatório')
        } else if (data.fullName.length < 3) {
            errors.push('fullName deve ter no mínimo 3 caracteres')
        } else if (data.fullName.length > 100) {
            errors.push('fullName deve ter no máximo 100 caracteres')
        }

        if (data.bio && data.bio.length > 500) {
            errors.push('bio deve ter no máximo 500 caracteres')
        }

        if (data.phone && !/^[0-9]{10,11}$/.test(data.phone)) {
            errors.push('phone deve conter 10 ou 11 dígitos')
        }

        if (data.address && data.address.state && data.address.state.length !== 2) {
            errors.push('state deve ter 2 caracteres')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    static validateUpdate(data) {
        const errors = []

        if (data.fullName && data.fullName.length < 3) {
            errors.push('fullName deve ter no mínimo 3 caracteres')
        }

        if (data.fullName && data.fullName.length > 100) {
            errors.push('fullName deve ter no máximo 100 caracteres')
        }

        if (data.bio && data.bio.length > 500) {
            errors.push('bio deve ter no máximo 500 caracteres')
        }

        if (data.phone && !/^[0-9]{10,11}$/.test(data.phone)) {
            errors.push('phone deve conter 10 ou 11 dígitos')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    static validateId(id) {
        return id && /^[0-9a-fA-F]{24}$/.test(id)
    }
}

module.exports = ProfileValidation