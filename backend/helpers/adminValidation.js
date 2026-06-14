const validator = require('validator')

class AdminValidation {
    static validateCreate(data) {
        const errors = []

        if (!data.name) {
            errors.push('name é obrigatório')
        } else if (data.name.length < 3) {
            errors.push('name deve ter no mínimo 3 caracteres')
        } else if (data.name.length > 100) {
            errors.push('name deve ter no máximo 100 caracteres')
        }

        if (!data.email) {
            errors.push('email é obrigatório')
        } else if (!validator.isEmail(data.email)) {
            errors.push('email inválido')
        }

        if (!data.password) {
            errors.push('password é obrigatório')
        } else if (data.password.length < 6) {
            errors.push('password deve ter no mínimo 6 caracteres')
        }

        return { isValid: errors.length === 0, errors }
    }

    static validateUpdate(data) {
        const errors = []

        if (data.name && data.name.length < 3) {
            errors.push('name deve ter no mínimo 3 caracteres')
        }

        if (data.name && data.name.length > 100) {
            errors.push('name deve ter no máximo 100 caracteres')
        }

        if (data.email && !validator.isEmail(data.email)) {
            errors.push('email inválido')
        }

        if (data.password && data.password.length < 6) {
            errors.push('password deve ter no mínimo 6 caracteres')
        }

        if (data.role && !['admin', 'moderator', 'super_admin'].includes(data.role)) {
            errors.push('role deve ser admin, moderator ou super_admin')
        }

        return { isValid: errors.length === 0, errors }
    }

    static validateId(id) {
        return id && /^[0-9a-fA-F]{24}$/.test(id)
    }
}

module.exports = AdminValidation